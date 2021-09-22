import {  languages,workspace, Uri, ViewColumn, window } from 'vscode';
import { promises as fs } from 'fs';
import * as path from 'path';

import axios, { AxiosError } from 'axios';


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

    let httpContent: any;
    try {
        const res = await axios.post('http://localhost:8010/', request, { transformResponse: (r) => r });
        httpContent = res.data;
    }
    catch (err) {
        const axiosErr = err as AxiosError;
        httpContent = axiosErr.response?.data;
    }
    const response = httpContent;
    const workspaceFolder = getWorkspaceFolder();
    if (workspaceFolder == null) {
        const message = "Post Client: Working folder not found, open a folder an try again" ;
        window.showErrorMessage(message);
        return;
    }
    const folder    = workspaceFolder + "/response/";
    const filePath  = folder + srcBaseName;

    ensureDirectoryExists(folder);
    await fs.writeFile(filePath, response, 'utf8');

    const newFile = Uri.parse("file:" + filePath);
    workspace.openTextDocument(newFile).then(document => {
        // document.save().then(() => {
        // const edit = new WorkspaceEdit();

        languages.setTextDocumentLanguage(document, "json");
        window.showTextDocument(document, {
            viewColumn: ViewColumn.Beside, preserveFocus: true, preview: false });
    });
}