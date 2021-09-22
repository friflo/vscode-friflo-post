import {  languages,workspace, Uri, ViewColumn, window } from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { PostClientConfig, ResponseData, globalResponseMap, configFileName, getInfo, RequestData, isPrivateIP } from './types';


async function ensureDirectoryExists(dir: string) {
    try {
        fs.mkdir(dir, {recursive: true });
    } catch (err: any) {
        if (err.code !== 'EEXIST') throw err;
    }
}

function getWorkspaceFolder() : string | null {
    if(workspace.workspaceFolders !== undefined) {
        // const wf = workspace.workspaceFolders[0].uri.path ;
        const f = workspace.workspaceFolders[0].uri.fsPath ; 
        return f;
    }
    return null;
}


export async function responseInfo (args: any) {
    console.log("responseInfo");
}

const axiosInstance = axios.create({
    // 3 sec timeout
    timeout: 3 * 1000,
  
    // keepAlive pools and reuses TCP connections, so it's faster
    httpAgent:  new http.Agent ({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    
    //follow up to 3 HTTP 3xx redirects
    maxRedirects: 3,
    
    // cap the maximum content length we'll accept to 50MBs, just in case
    maxContentLength: 50 * 1000 * 1000
  });

export function getConfigPath(fileName: string) : string {
    const srcFolder     = path.dirname (fileName) + "/";
    const configPath    = srcFolder + "/" + configFileName;
    return configPath;
}

export async function codelensPost (args: any) {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }
    const request       = editor.document.getText();

    const fileName      = editor.document.fileName;
    const configPath    = getConfigPath(fileName);
    let config: PostClientConfig;

    try {
        const configFile = await fs.readFile(configPath,'utf8');
        try {
            config = JSON.parse(configFile);
        }
        catch (err) {
            window.showInformationMessage(`error in: ${configFileName}. ${err}'`);
            const configUri = Uri.parse("file:" + configPath);
            const document = await workspace.openTextDocument(configUri);
            await languages.setTextDocumentLanguage(document, "json");
            await window.showTextDocument(document, { viewColumn: ViewColumn.Active, preserveFocus: false, preview: false });
            return;
        }
    }
    catch (err) {
        await createConfigFile(configPath);
        return;
    }

    let response: ResponseData | null = null;
    const requestData: RequestData = {
        url:        config.endpoint,
        headers:    config.headers,
    };
    const startTime = new Date().getMilliseconds();
    try {
        const requestConfig: AxiosRequestConfig = {
            transformResponse:  (r) => r,
            headers:            config.headers,
        };
        const res = await axiosInstance.post<string>(config.endpoint, request, requestConfig);
        const executionTime = new Date().getMilliseconds() - startTime;
        response = {
            request:        requestData,
            status:         res.status,
            statusText:     res.statusText,
            content:        res.data,
            headers:        res.headers,
            executionTime:  executionTime,
        };
        console.log(res.headers, `${executionTime} ms`);
    }
    catch (err) {
        const executionTime = new Date().getMilliseconds() - startTime;
        const axiosErr = err as AxiosError<string>;
        if (axiosErr.response) {
            response = {
                request:    requestData,
                status:     axiosErr.response.status,
                statusText: axiosErr.response.statusText,
                content:    axiosErr.response.data,
                headers:    axiosErr.response.headers,
                executionTime:  executionTime,
            };
        } else {
            response = {
                request:        requestData,
                status:         0,
                statusText:     axiosErr.message,
                content:        axiosErr.message,
                headers:        null,
                executionTime:  executionTime,
            };
        }       
    }
    if (!response)
        return;

    const workspaceFolder = getWorkspaceFolder();
    if (workspaceFolder == null) {
        const message = "Post Client: Working folder not found, open a folder an try again" ;
        window.showErrorMessage(message);
        return;
    }
    const   srcBaseName   = path.basename(fileName);
    let     dstFolder     = path.dirname (fileName) + "/";
    if (config.responseFolder)
        dstFolder += config.responseFolder;
    const dstBaseName   = srcBaseName.replace("request.json","response.json");
    const filePath  = path.normalize(dstFolder + "/" + dstBaseName);

    globalResponseMap[filePath] = response;

    ensureDirectoryExists(dstFolder);
    await fs.writeFile(filePath, response.content, 'utf8');
    console.log(`saved: ${filePath}`);

    const newFile = Uri.parse("file:" + filePath);
    
    const document = await workspace.openTextDocument(newFile);
    await languages.setTextDocumentLanguage(document, "json");
    await window.showTextDocument(document, { viewColumn: ViewColumn.Beside, preserveFocus: true, preview: false });

    const isPrivate = isPrivateIP(response.request.url);
    const type      = isPrivate ?  "💻" : "🌐";
    const status    = `${type} ${getInfo(response)} (${++requestCount})`;
    window.setStatusBarMessage(status, 10 * 1000);
}

let requestCount = 0;

async function createConfigFile(configPath: string) {
    const answer = await window.showInformationMessage(
        `"config file: '${configFileName}' not found. Create?`,
        ...["Yes", "No"]
    );
    if (answer !== "Yes") {
        return;
    }
    const config: PostClientConfig = {
        endpoint:     "http://localhost:8080/",
        headers: {
            "Content-Type": "application/json",
            "Connection":   "Keep-Alive"
        },
        responseFolder: "response"
    };
    const configFile = JSON.stringify(config, null, 4);
    await fs.writeFile(configPath, configFile, 'utf8');

    const configUri = Uri.parse("file:" + configPath);

    const document = await workspace.openTextDocument(configUri);
    await languages.setTextDocumentLanguage(document, "json");
    await window.showTextDocument(document, { viewColumn: ViewColumn.Active, preserveFocus: false, preview: false });



    // window.showInformationMessage(`created config: '${configFileName}'`);
}