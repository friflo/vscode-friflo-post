// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { ViewColumn, window } from 'vscode';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as minimatch  from "minimatch";
import { getInfo, RequestData, RequestType, ResponseData, GetFileContent, FileContent, renderResponseData, getResultIcon } from '../models/RequestData';
import { configFileName, defaultConfigString, getConfigPath, getEndpoint, getHeaders, mdExt, parseConfig, PostConfig, respExt, respMdExt, ResponseConfig } from '../models/PostConfig';
import { ensureDirectoryExists, getWorkspaceFolder, openShowTextFile } from '../utils/vscode-utils';
import { createHttpRequest, executeHttpRequest } from '../utils/http-got';
import { showResponseInfo } from '../command-response-info/executeResponseInfo';


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
    // const isPrivate      = isPrivateIP(endpoint.url);
    const iconType          = "🌐";
    const progressStatus    = `${requestType} ${iconType} ${srcBaseName}`;
    // dont await
    window.setStatusBarMessage(""); // clear status. Otherwise its confusing having a previous result & a pending request which is created below

    let   seconds       = 0;
    const headers       = getHeaders(config, endpoint, fileContent.path);
    const destPathTrunk = getDestPathTrunk(fileContent.path, config.response);
    
    const requestData: RequestData = {
        url:            endpoint.url,
        destPathTrunk:  destPathTrunk,
        type:           requestType,
        requestSeq:   ++requestCount,
        headers:        headers,
    };
    
    const response: ResponseData = await window.withProgress({
        location:       vscode.ProgressLocation.Window,
        cancellable:    true,
        title:          progressStatus
    }, async (progress, token) => {
        const interval = setInterval(() => {
            progress.report({message: `${++seconds} sec`});
        }, 1000);
        // const cancelTokenSource = axios.CancelToken.source();
        const httpRequest = createHttpRequest (requestData, requestBody);
        token.onCancellationRequested(() => {
            httpRequest.request.cancel();
        });
        const  response = await executeHttpRequest(httpRequest);
        clearInterval(interval);
        return response; 
    });

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

    const dstFolder     = path.dirname (destPathTrunk) + "/";
    const respMdPath    = destPathTrunk + mdExt;
    await ensureDirectoryExists(dstFolder);

    await removeDestFiles(dstFolder, destPathTrunk);

    const responseData      = renderResponseData(response);
    await fs.writeFile(respMdPath, responseData, 'utf8');

    const responseContent   = getResponseFileContent(response);
        // open response ViewColumn.Beside to enable instant modification to request and POST again.
        const showOptions: vscode.TextDocumentShowOptions = { viewColumn: ViewColumn.Beside, preserveFocus: true, preview: true };
    if (responseContent) {
        await fs.writeFile(response.path,    responseContent.content, 'utf8');
        await openShowTextFile(response.path,    null, showOptions);
    } else {
        await showResponseInfo(respMdPath, true);
    }
    const icon      = getResultIcon(response.httpResponse);
    const status    = `${icon} ${srcBaseName} - ${getInfo(response)}`;
    // dont await    
    window.setStatusBarMessage(status, 10 * 1000);
    return response;
}

async function removeDestFiles (dstFolder: string, destPathTrunk: string) {
    const filter = destPathTrunk.substring(dstFolder.length) + "*";
    const list = await fs.readdir(dstFolder);
    for (let i = 0; i < list.length; i++) {
        const filePath = list[i];
        // .resp.md are always written
        if (filePath.endsWith(respMdExt))
            continue;
        if (minimatch(filePath, filter, { matchBase: true })) {
            await fs.unlink(dstFolder + "/" + filePath);
        }
    }
}

function getResponseFileContent(responseData: ResponseData) : FileContent | null { // todo obsolete
    const res = responseData.httpResponse;
    if (res.responseType == "result") {
        return {
            content:    res.content,
            path:       null!
        };
    }
    return null;
}

function replaceExt (fileName: string, respExt: string) : string {
    if (!respExt) {
        return fileName;
    }
    const ext               = path.extname(fileName);
    const fileWithoutExt    =  fileName.substring(0, fileName.length - ext.length);
    return `${fileWithoutExt}${respExt}`;
}

function getDestPathTrunk (fileName: string, responseConfig: ResponseConfig) : string {
    const responseBase = replaceExt (fileName, respExt);
    if (responseConfig.folder) {
        const   dstFolder   = path.dirname (fileName) + "/";
        return  dstFolder + "/" + responseConfig.folder + "/" + path.basename(responseBase);
    }
    return responseBase;
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
