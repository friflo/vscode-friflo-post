// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { ViewColumn, window, workspace } from 'vscode';


export async function executeResponseContent (contentPath: string) {
    const doc = await workspace.openTextDocument(contentPath);
    // const list = await languages.getLanguages();
    await window.showTextDocument(doc, ViewColumn.Active);
}