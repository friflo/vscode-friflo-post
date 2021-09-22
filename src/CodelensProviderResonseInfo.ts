import * as vscode from 'vscode';
import { globalResponseMap } from './types';
import * as path from 'path';
import { addCodelens as createCodelens } from './utils';

/**
 * CodelensProviderResponseInfo
 */
export class CodelensProviderResponseInfo implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
 
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
         vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("vscode-post-client").get("enableCodeLens", true)) {
            const fileName  = path.normalize(document.fileName);
            if (fileName.endsWith("response.json")) {
                const responseMap = globalResponseMap;
                const info = responseMap[fileName];
                if (info) {
                    this.codeLenses = createCodelens(document);
                    // const index = this.codeLenses.findIndex(item => item.command?.command == "vscode-post-client.responseInfo");
                    const contentLength = info.headers["content-length"];
                    const contentType   = info.headers["content-type"];
                    const infoStr = `${info.status} ${info.statusText} • length ${contentLength} • ${contentType}`;
                    const entry = this.codeLenses[0];
                    (entry as any)["infoStr"] = infoStr;                    
                    return this.codeLenses;
                }    
            }
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (vscode.workspace.getConfiguration("vscode-post-client").get("enableCodeLens", true)) {
            const infoStr = (codeLens as any)["infoStr"] as string;
            codeLens.command = {
                title:      infoStr,
                tooltip:    "POST file content to an API",
                command:    "vscode-post-client.responseInfo",
                arguments:  ["Argument 1", false]
            };
            return codeLens;
        }
        return null;
    }
}

