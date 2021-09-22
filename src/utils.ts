import * as vscode from 'vscode';

const firstCharRegEx = /[^\s\\]/;

export function addCodelens(document: vscode.TextDocument) : vscode.CodeLens[] {
    const codeLenses:  vscode.CodeLens[] = [];
    const text = document.getText();
    const firstChar = firstCharRegEx;			
    const matches = firstChar.exec(text);
    if (matches) {
        const line      = document.lineAt(document.positionAt(matches.index).line);
        const position  = new vscode.Position(line.lineNumber, 0);
        const range     = document.getWordRangeAtPosition(position,firstChar);
        if (range) {
            codeLenses.push(new vscode.CodeLens(range));
        }
    }
    return codeLenses;
}