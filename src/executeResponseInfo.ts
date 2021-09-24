// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { Uri, ViewColumn, window, workspace } from 'vscode';


export async function executeResponseInfoPost () {
    const uri = Uri.parse("response-data:" + "test-abc");
    const doc = await workspace.openTextDocument(uri);
    await window.showTextDocument(doc, ViewColumn.Active);
}