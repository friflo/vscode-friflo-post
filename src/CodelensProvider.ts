import * as vscode from 'vscode';
import { addCodelens as createCodelens } from './utils';
import { PostClientConfig } from './types';
import { promises as fs } from 'fs';
import { getConfigPath, isConfigFile } from './commands';

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
            if (!isConfig && document.fileName.endsWith(".json")) {
                const configPath    = getConfigPath(document.fileName);
                let   endpoint: string | null = null;
                try {
                    const configFile    = await fs.readFile(configPath,'utf8');
                    const config        = JSON.parse(configFile) as PostClientConfig;
                    endpoint            = config.endpoint;
                    const codeLenses    = createCodelens(document);
                    const entry = codeLenses[0];
                    (entry as any)["endpoint"] = endpoint;
                    return codeLenses;
                }
                catch (err) { 
                    // nothing to do
                }
                if (document.fileName.endsWith("request.json")) {
                    return createCodelens(document);
                }
                return [];
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

