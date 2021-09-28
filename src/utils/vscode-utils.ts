// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import { promises as fs } from 'fs';
import { CodeLens, languages, Position, TextDocument, TextDocumentShowOptions, TextEditor, Uri, window, workspace } from 'vscode';

export async function ensureDirectoryExists(dir: string) {
    try {
        await fs.mkdir(dir, {recursive: true });
    } catch (err: any) {
        if (err.code !== 'EEXIST') throw err;
    }
}

export async function openShowTextFile (path: string, languageId: string | null, options?: TextDocumentShowOptions) : Promise<TextEditor> {
    const configUri = Uri.parse("file:" + path);
    const document = await workspace.openTextDocument(configUri);
    if (languageId)
        await languages.setTextDocumentLanguage(document, languageId);
    return await window.showTextDocument(document, options);
}

const firstCharRegEx = /[^\s\\]/;

export function createCodelens(document: TextDocument) : CodeLens[] {
    const codeLenses:  CodeLens[] = [];
    const text = document.getText();
    const firstChar = firstCharRegEx;			
    const matches = firstChar.exec(text);
    if (matches) {
        const line      = document.lineAt(document.positionAt(matches.index).line);
        const position  = new Position(line.lineNumber, 0);
        const range     = document.getWordRangeAtPosition(position,firstChar);
        if (range) {
            codeLenses.push(new CodeLens(range));
        }
    }
    return codeLenses;
}