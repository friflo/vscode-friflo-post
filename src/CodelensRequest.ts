// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { RequestType } from './RequestData';
import { createCodelens } from './Codelens-utils';
import { getConfigPath, getEndpoint, isConfigFile, parseConfig } from './PostConfig';
import { standardContentTypes } from './standardContentTypes';

/**
 * CodelensRequest
 */
export class CodelensRequest implements vscode.CodeLensProvider
{
    private         _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses:  vscode.Event<void> = this._onDidChangeCodeLenses.event;
    public readonly requestType:            RequestType;
    public readonly commandName:            string;

    constructor(requestType: RequestType, commandName: string) {
        this.requestType    = requestType;
        this.commandName    = commandName;
         vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {        
        if (vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            const fileName = document.fileName;
            const isConfig = isConfigFile(fileName);
            if (isConfig)
                return [];
            const configPath    = getConfigPath(fileName);
            try {
                const configFile    = await fs.readFile(configPath,'utf8');
                const config        = parseConfig(configFile);
                const endpoint      = getEndpoint(config, fileName);
                if (endpoint == null) {
                    const ext       = path.extname(fileName);
                    if (!standardContentTypes[ext])
                        return [];
                }
                const codeLenses    = createCodelens(document);
                const entry = codeLenses[0];
                if (this.requestType == "POST") {
                    (entry as any)["endpoint"]  = endpoint?.url;
                }
                (entry as any)["requestType"]   = this.requestType;
                return codeLenses;
            }
            catch (err) { 
                // ignore
            }
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            const   requestType = (codeLens as any)["requestType"]  as RequestType;
            const   endpoint    = (codeLens as any)["endpoint"]     as string | null;
            let     tooltip     = `POST file content an REST API`;
            if (endpoint) {
                tooltip = `${requestType} file content to: ${endpoint}`;
            }
            codeLens.command = {
                title:      endpoint ? `${requestType} ${endpoint}` : requestType,
                tooltip:    tooltip,
                command:    this.commandName,
                // arguments: ["Argument 1", false]
            };
            return codeLens;
        }
        return null;
    }
}

