// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { commands, Uri } from 'vscode';


export async function executeResponseInfo (respPath: string) {
    // const doc = await workspace.openTextDocument(respPath);
    // await languages.setTextDocumentLanguage(doc, "markdown");
    // await window.showTextDocument(doc, ViewColumn.Active);

    const uri = Uri.file(respPath);

    // https://github.com/microsoft/vscode/blob/main/extensions/markdown-language-features/src/commands/showPreview.ts
    await commands.executeCommand("markdown.showPreview", uri);
}
