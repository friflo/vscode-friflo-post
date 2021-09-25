// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { ViewColumn, window } from 'vscode';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import { responseInfoMap, getInfo, RequestData, isPrivateIP, RequestType, ResponseData, GetFileContent } from '../models/RequestData';
import { configFileName, defaultConfigString, getConfigPath, getEndpoint, getHeaders, parseConfig, PostConfig, ResponseConfig } from '../models/PostConfig';
import { ensureDirectoryExists, getWorkspaceFolder, getResponseInfoPath, openShowTextFile } from '../utils/vscode-utils';
import { createHttpRequest, executeHttpRequest } from '../utils/http-got';


let requestCount = 0;

export async function executeRequest (requestType: RequestType, ...args: any[]) : Promise<ResponseData | null>{
    const fileContent   = await GetFileContent(args);
    if (fileContent == null)
        return null;
    const requestBody   = fileContent.content;
    const configPath    = getConfigPath(fileContent.path);
    let config: PostConfig;

    try {
        const configFile = await fs.readFile(configPath,'utf8');
        try {
            config = parseConfig(configFile);
        }
        catch (err) {
            // dont await
            window.showInformationMessage(`error in: ${configFileName} config. ${err}'`);
            await openShowConfigFile (configPath);
            return null;
        }
    }
    catch (err) {
        await createConfigFile(configPath);
        return null;
    }

    const endpoint = getEndpoint(config, fileContent.path);
    if (endpoint == null) {
        // dont await
        window.showInformationMessage(`found no matching endpoint in: ${configFileName} config.'`);
        await openShowConfigFile(configPath);
        return null;
    }
    
    const srcBaseName       = path.basename(fileContent.path);
    const isPrivate         = isPrivateIP(endpoint.url);
    const iconType          = isPrivate ?  "💻" : "🌐";
    const progressStatus    = `${requestType} ${iconType} ${srcBaseName}`;
    // dont await
    window.setStatusBarMessage("0 sec", 1100);

    let seconds = 0;
    const interval = setInterval(() => {
        window.setStatusBarMessage(`${++seconds} sec`, 1100);
    }, 1000);

    const headers       = getHeaders(config, endpoint, fileContent.path);
    const destFile      = getDestFile(fileContent.path, config.response);
    const respInfoPath  = getResponseInfoPath(destFile)!;
    
    const requestData: RequestData = {
        url:            endpoint.url,
        infoUri:        vscode.Uri.parse("response-data:" + respInfoPath),
        type:           requestType,
        requestSeq:   ++requestCount,
        headers:        headers,
    };
    
    const response = await window.withProgress({
        location:       vscode.ProgressLocation.Window,
        cancellable:    true,
        title:          progressStatus
    }, async (progress, token) => {
        // const cancelTokenSource = axios.CancelToken.source();
        const httpRequest = createHttpRequest (requestData, requestBody);
        token.onCancellationRequested(() => {
            httpRequest.request.cancel();
        });
        progress.report({  increment: 0 });
        const  response = await executeHttpRequest(httpRequest);
        return response; 
    });
    clearInterval(interval);

    if (!response) {
        return null;
    }

    const workspaceFolder = getWorkspaceFolder();
    if (workspaceFolder == null) {
        const message = "Working folder not found, open a folder and try again" ;
        // dont await
        window.showErrorMessage(message);
        return null;
    }

    const dstFolder                 = path.dirname (destFile) + "/";
    responseInfoMap[respInfoPath]   = response;
    ensureDirectoryExists(dstFolder);

    const res       = response.httpResponse;
    const content   = res.responseType == "result" ? res.content : res.message;
    await fs.writeFile(destFile, content, 'utf8');
    // console.log(`saved: ${filePath}`);

    await openShowTextFile(destFile, null, { viewColumn: ViewColumn.One, preserveFocus: true, preview: false });

    const iconResult    = response.httpResponse == null ? "😕" : iconType;
    const status        = `${iconResult} ${srcBaseName} - ${getInfo(response)}`;
    // dont await
    window.setStatusBarMessage(status, 10 * 1000);
    return response;
}

function prefixExt (fileName: string, extPrefix: string) : string {
    if (!extPrefix) {
        return fileName;
    }
    const ext               = path.extname(fileName);
    const fileWithoutExt    =  fileName.substring(0, fileName.length - ext.length);
    return `${fileWithoutExt}${extPrefix}${ext}`;
}

function getDestFile (fileName: string, responseConfig: ResponseConfig) : string {
    const prefixed = prefixExt (fileName, responseConfig.ext);
    if (responseConfig.folder) {
        const   dstFolder   = path.dirname (fileName) + "/";
        return  dstFolder + "/" + responseConfig.folder + "/" + path.basename(prefixed);
    }
    return prefixed;
}

async function createConfigFile(configPath: string) : Promise<boolean> {
    const answer = await window.showInformationMessage(
        `"${configFileName} file not found. Create?`,
        ...["Yes", "No"]
    );
    if (answer !== "Yes") {
        return false;
    }
    await fs.writeFile(configPath, defaultConfigString, 'utf8');

    await openShowConfigFile(configPath);
    return true;
}

async function openShowConfigFile(configPath: string) : Promise<vscode.TextEditor> {
    return await openShowTextFile( configPath, "json", { viewColumn: ViewColumn.One, preserveFocus: false, preview: false });
}
