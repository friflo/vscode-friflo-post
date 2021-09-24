// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { languages, Uri, ViewColumn, window, workspace } from 'vscode';


export async function executeResponseInfoPost (uri: Uri) {
    const doc = await workspace.openTextDocument(uri);
    // const list = await languages.getLanguages();
    await languages.setTextDocumentLanguage(doc, "plaintext");
    await window.showTextDocument(doc, ViewColumn.Active);
}