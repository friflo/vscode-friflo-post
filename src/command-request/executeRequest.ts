// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { ViewColumn, window } from 'vscode';
import * as vscode from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { ResponseData, globalResponseMap, getInfo, RequestData, isPrivateIP, FileContent, RequestType } from '../models/RequestData';
import { configFileName, defaultConfigString, getConfigPath, getEndpoint, getHeaders, parseConfig, PostConfig } from '../models/PostConfig';
import { ensureDirectoryExists, getWorkspaceFolder, getWorkspacePath, openShowTextFile } from '../utils/vscode-utils';

const axiosInstance = axios.create({
    // 60 sec timeout
    timeout: 60 * 1000,
  
    // keepAlive pools and reuses TCP connections, so it's faster
    httpAgent:  new http.Agent ({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    
    //follow up to 3 HTTP 3xx redirects
    maxRedirects: 3,
    
    // cap the maximum content length we'll accept to 50MBs, just in case
    maxContentLength: 50 * 1000 * 1000
  });

async function GetFileContent(...args: any[]) : Promise<FileContent | null> {
    const selectedFilePath = args && args[0] && args[0][0] ? args[0][0].fsPath : null;
    if (selectedFilePath) {
        const selectedFilePath = args[0][0].fsPath;
        const content       = await fs.readFile(selectedFilePath,'utf8');
        return {
            path:       selectedFilePath,
            content:    content
        };
    }
    const editor = window.activeTextEditor;
    if (!editor) {
        return null;
    }
    return {
        path:       editor.document.fileName,
        content:    editor.document.getText()
    };
}

export async function executeRequest (requestType: RequestType, ...args: any[]) {
    const fileContent   = await GetFileContent(args);
    if (fileContent == null)
        return;
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
            return;
        }
    }
    catch (err) {
        await createConfigFile(configPath);
        return;
    }

    const endpoint = getEndpoint(config, fileContent.path);
    if (endpoint == null) {
        // dont await
        window.showInformationMessage(`found no matching endpoint in: ${configFileName} config.'`);
        await openShowConfigFile(configPath);
        return;
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

    const headers = getHeaders(config, endpoint, fileContent.path);
    const requestData: RequestData = {
        url:            endpoint.url,
        type:           requestType,
        requestSeq:   ++requestCount,
        headers:        headers,
    };

    const cancelTokenSource = axios.CancelToken.source();

    const response = await window.withProgress({
        location:       vscode.ProgressLocation.Window,
        cancellable:    true,
        title:          progressStatus
    }, async (progress, token) => {
        token.onCancellationRequested(() => {
            cancelTokenSource.cancel();
        });
        progress.report({  increment: 0 });
        const  response = await executeHttpRequest(requestData, requestBody, cancelTokenSource);
        return response;
    });
    clearInterval(interval);

    if (!response)
        return;

    const workspaceFolder = getWorkspaceFolder();
    if (workspaceFolder == null) {
        const message = "Working folder not found, open a folder and try again" ;
        // dont await
        window.showErrorMessage(message);
        return;
    }

    let     dstFolder     = path.dirname (fileContent.path) + "/";

    let filePath      = prefixExt (fileContent.path, config.response.ext);
    if (config.response.folder) {
        dstFolder   += config.response.folder + "/";
        filePath    = dstFolder + path.basename(filePath);
    }
    const relativePath = getWorkspacePath(filePath)!;
    globalResponseMap[relativePath] = response;

    ensureDirectoryExists(dstFolder);
    await fs.writeFile(filePath, response.content, 'utf8');
    // console.log(`saved: ${filePath}`);

    await openShowTextFile(filePath, null, { viewColumn: ViewColumn.Beside, preserveFocus: true, preview: false });

    const iconResult    = response.status == 0 ? "😕" : iconType;
    const status        = `${iconResult} ${srcBaseName} - ${getInfo(response)}`;
    // dont await
    window.setStatusBarMessage(status, 10 * 1000);
}

function prefixExt (fileName: string, extPrefix: string) : string {
    if (!extPrefix) {
        return fileName;
    }
    const ext               = path.extname(fileName);
    const fileWithoutExt    =  fileName.substring(0, fileName.length - ext.length);
    return `${fileWithoutExt}${extPrefix}${ext}`;
}

async function executeHttpRequest(requestData: RequestData, requestBody: string, cancelTokenSource: CancelTokenSource) : Promise<ResponseData | null> {
    let response: ResponseData | null;
    const startTime = new Date().getTime();
    try {
        const requestConfig: AxiosRequestConfig = {
            transformResponse:  (r) => r,
            headers:            requestData.headers,
            cancelToken:        cancelTokenSource.token
        };
        let res: AxiosResponse<string>;
        switch (requestData.type) {
            case "POST":
                res = await axiosInstance.post<string>(requestData.url, requestBody, requestConfig);
                break;
            case "PUT":
                res = await axiosInstance.put<string>(requestData.url, requestBody, requestConfig);
                break;
            default:
                throw "Unsupported request type: " + requestData.type;
        }        
        const executionTime = new Date().getTime() - startTime;
        response = {
            requestData:        requestData,
            status:         res.status,
            statusText:     res.statusText,
            content:        res.data,
            headers:        res.headers,
            executionTime:  executionTime,
        };
        // console.log(res.headers, `${executionTime} ms`);
    }
    catch (err) {
        const executionTime = new Date().getTime() - startTime;
        const axiosErr = err as AxiosError<string>;
        if (axiosErr.response) {
            response = {
                requestData:        requestData,
                status:         axiosErr.response.status,
                statusText:     axiosErr.response.statusText,
                content:        axiosErr.response.data,
                headers:        axiosErr.response.headers,
                executionTime:  executionTime,
            };
        } else {            
            const canceled = axios.isCancel(err);
            const message = canceled ? "request canceled" : axiosErr.message;
            response = {
                requestData:        requestData,
                status:         0,
                statusText:     message,
                content:        message,
                headers:        null,
                executionTime:  executionTime,
            };
        }       
    }
    return response;
}

let requestCount = 0;

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
    return await openShowTextFile( configPath, "json", { viewColumn: ViewColumn.Active, preserveFocus: false, preview: false });
}
