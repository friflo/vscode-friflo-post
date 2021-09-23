import * as vscode from 'vscode';
import { addRequestCommand, resolveRequestCommand as resolveRequestCommand } from './utils';

/**
 * CodelensPost
 */
export class CodelensPost implements vscode.CodeLensProvider
{
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
         vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {        
        return await addRequestCommand(document, "vscode-friflo-post");
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return resolveRequestCommand(codeLens, "vscode-friflo-post");
    }
}

