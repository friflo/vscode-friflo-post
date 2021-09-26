// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { commands, TextDocumentShowOptions, Uri, ViewColumn, window, workspace } from 'vscode';


export async function executeResponseInfo (respPath: string) {
    await showResponseInfo(respPath, false, false);
}


export async function showResponseInfo (respPath: string, asText: boolean, toSide: boolean) {
    if (asText) {
        const showOptions: TextDocumentShowOptions = { viewColumn: ViewColumn.Beside, preserveFocus: true, preview: true };
        const doc = await workspace.openTextDocument(respPath);
        // await languages.setTextDocumentLanguage(doc, "markdown");
        await window.showTextDocument(doc, showOptions);
        return;
    }
    const uri = Uri.file(respPath);
    // https://github.com/microsoft/vscode/blob/main/extensions/markdown-language-features/src/commands/showPreview.ts
    const cmd = toSide ? "markdown.showPreviewToSide" : "markdown.showPreview";
    await commands.executeCommand(cmd, uri);
}
