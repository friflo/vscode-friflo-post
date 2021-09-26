// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { languages, ViewColumn, window, workspace } from 'vscode';


export async function executeResponseInfo (respPath: string) {
    const doc = await workspace.openTextDocument(respPath);
    // const list = await languages.getLanguages();
    await languages.setTextDocumentLanguage(doc, "markdown");
    await window.showTextDocument(doc, ViewColumn.Active);
}