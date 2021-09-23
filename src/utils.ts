// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { promises as fs } from 'fs';
import { languages, TextDocumentShowOptions, TextEditor, Uri, window, workspace } from 'vscode';

export async function ensureDirectoryExists(dir: string) {
    try {
        fs.mkdir(dir, {recursive: true });
    } catch (err: any) {
        if (err.code !== 'EEXIST') throw err;
    }
}

export function getWorkspaceFolder() : string | null {
    if(workspace.workspaceFolders !== undefined) {
        // const wf = workspace.workspaceFolders[0].uri.path ;
        const f = workspace.workspaceFolders[0].uri.fsPath ; 
        return f;
    }
    return null;
}

export async function openShowTextFile (path: string, languageId: string | null, options?: TextDocumentShowOptions) : Promise<TextEditor> {
    const configUri = Uri.parse("file:" + path);
    const document = await workspace.openTextDocument(configUri);
    if (languageId)
        await languages.setTextDocumentLanguage(document, languageId);
    return await window.showTextDocument(document, options);
}