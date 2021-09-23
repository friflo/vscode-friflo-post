import * as vscode from 'vscode';
import { addResponseInfoCommand, resolveResponseInfoCommand } from './utils';

/**
 * CodelensResponseInfo
 */
export class CodelensResponseInfo implements vscode.CodeLensProvider
{
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
         vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken):  Promise<vscode.CodeLens[]> {
        return await addResponseInfoCommand (document, "vscode-friflo-post");
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return resolveResponseInfoCommand(codeLens, "vscode-friflo-post");
    }
}

