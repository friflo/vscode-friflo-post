import {  languages,workspace, Uri, ViewColumn, window } from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';

import axios, { AxiosError } from 'axios';
import { PostClientConfig, ResponseData, globalResponseMap } from './types';


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



export async function codelensPost (args: any) {
    // window.showInformationMessage(`CodeLens action clicked with args=${args}`);

    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }
    const request       = editor.document.getText();
    const srcPath       = editor.document.fileName;
    const srcBaseName   = path.basename(srcPath);
    const srcFolder     = path.dirname (srcPath);

    const configPath = srcFolder + "/post-client";


    let config: PostClientConfig;

    try {
        const configFile = await fs.readFile(configPath,'utf8');
        config = JSON.parse(configFile);
    }
    catch (err) {
        config = {
            endpoint: 'http://localhost:8080/'
        };
        const configFile = JSON.stringify(config, null, 4);
        await fs.writeFile(configPath, configFile, 'utf8');
    }

    let response: ResponseData | null = null;
    try {
        const res = await axios.post(config.endpoint, request, { transformResponse: (r) => r });
        response = {
            status:     res.status,
            statusText: res.statusText,
            content:    res.data,
            headers:    res.headers
        };
    }
    catch (err) {
        const axiosErr = err as AxiosError<string>;
        if (axiosErr.response) {
            response = {
                status:     axiosErr.response.status,
                statusText: axiosErr.response.statusText,
                content:    axiosErr.response.data,
                headers:    axiosErr.response.headers
            };
        } else {
            response = {
                status:     0,
                statusText: axiosErr.message,
                content:    axiosErr.message,
                headers:    null
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
    const folder    = workspaceFolder + "/response/";
    const filePath  = path.normalize(folder + srcBaseName);

    globalResponseMap[filePath] = response;

    ensureDirectoryExists(folder);
    await fs.writeFile(filePath, response.content, 'utf8');

    const newFile = Uri.parse("file:" + filePath);
    workspace.openTextDocument(newFile).then(document => {
        // document.save().then(() => {
        // const edit = new WorkspaceEdit();

        languages.setTextDocumentLanguage(document, "json");
        window.showTextDocument(document, {
            viewColumn: ViewColumn.Beside, preserveFocus: true, preview: false });
    });
}