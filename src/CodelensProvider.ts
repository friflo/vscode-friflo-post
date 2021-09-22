import * as vscode from 'vscode';
import * as path from 'path';
import { addCodelens as createCodelens } from './utils';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider
{
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
         vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("vscode-post-client").get("enablePostClient", true)) {
            const fileName  = path.normalize(document.fileName);
            if (fileName.endsWith("request.json")) {
                const codeLenses = createCodelens(document);
                return codeLenses;
            }            
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (vscode.workspace.getConfiguration("vscode-post-client").get("enablePostClient", true)) {
            codeLens.command = {
                title: "POST",
                tooltip: "POST file content to: ",
                command: "vscode-post-client.codelensPost",
                // arguments: ["Argument 1", false]
            };
            return codeLens;
        }
        return null;
    }
}

