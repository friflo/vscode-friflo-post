import * as vscode from 'vscode';
import { addCodelens as createCodelens } from './utils';
import { promises as fs } from 'fs';
import { getConfigPath, isConfigFile, parseConfig } from './commands';
import { getEndpoint } from './types';

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

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            const isConfig = isConfigFile(document.fileName);
            if (isConfig)
                return [];
            const configPath    = getConfigPath(document.fileName);
            try {
                const configFile    = await fs.readFile(configPath,'utf8');
                const config        = parseConfig(configFile);
                const url           = getEndpoint(config, document.fileName);
                if (url == null)
                    return createCodelens(document);
                const codeLenses    = createCodelens(document);
                const entry = codeLenses[0];
                (entry as any)["endpoint"] = url;
                return codeLenses;
            }
            catch (err) { 
                // return createCodelens(document);
            }            
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            const   endpoint    = (codeLens as any)["endpoint"] as string | null;
            let     tooltip     = `POST file content an REST API`;
            if (endpoint) {
                tooltip = `POST file content to: ${endpoint}`;
            }
            codeLens.command = {
                title:      endpoint ? `POST ${endpoint}` : "POST",
                tooltip:    tooltip,
                command:    "vscode-friflo-post.codelensPost",
                // arguments: ["Argument 1", false]
            };
            return codeLens;
        }
        return null;
    }
}

