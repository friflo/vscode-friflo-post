// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { languages, Uri, ViewColumn, window, workspace } from 'vscode';


export async function executeResponseInfoPost (args: any) {
    const responseFile = args;
    const uri = Uri.parse("response-data:" + responseFile);
    const doc = await workspace.openTextDocument(uri);
    // const list = await languages.getLanguages();
    await languages.setTextDocumentLanguage(doc, "http");
    await window.showTextDocument(doc, ViewColumn.Active);
}