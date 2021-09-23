// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { TextEditor, window, workspace } from 'vscode';
import { encodeLocation } from './provider';


export async function executeResponseInfoPost (editor: TextEditor) {
    console.log("responseInfo");

    const uri = encodeLocation(editor.document.uri, editor.selection.active);
    const doc = await workspace.openTextDocument(uri);
    await window.showTextDocument(doc, editor.viewColumn! + 1);
}