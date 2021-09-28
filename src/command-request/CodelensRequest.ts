// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { RequestType } from '../models/RequestData';
import { getConfigPath, getEndpoint, isConfigFile, parseConfig, PostConfig } from '../models/PostConfig';
import { standardContentTypes } from '../utils/standard-content-types';
import { createCodelens } from '../utils/vscode-utils';

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
        if (!vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            return [];
        }
        const fileName = document.fileName;
        const isConfig = isConfigFile(fileName);
        if (isConfig)
            return [];
        const config = await getConfigOf(fileName);
        if (config == null)
            return [];
        const endpoint = getEndpoint(config, fileName);
        let requestUrl = "";
        if (endpoint == null) {
            const ext       = path.extname(fileName);
            if (!standardContentTypes[ext])
                return [];
        } else {
            requestUrl = " " + endpoint.url;
        }
        const codeLenses    = createCodelens(document);
        const codeLense     = codeLenses[0];
        let   tooltip       = `${this.requestType} file content`;
        if (endpoint) {
            tooltip += `to ${endpoint.url}`;
        }
        const isPost        = this.requestType == "POST";
        codeLense.command = {
            title:      isPost ? `${this.requestType} ${requestUrl}` : this.requestType,
            tooltip:    tooltip,
            command:    this.commandName,
            arguments: [fileName]
        };
        return codeLenses;
    }

    public resolveCodeLens(codeLense: vscode.CodeLens, token: vscode.CancellationToken) {
        if (!vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            return null;
        }
        return codeLense;
    }
}


export async function getConfigOf (fileName: string) : Promise<PostConfig | null> {
    const configPath = getConfigPath(fileName);
    try {
        const configFile    = await fs.readFile(configPath,'utf8');
        const config        = parseConfig(configFile);
        return config;
    }
    catch (err) {
        // no endpoint configured
    }
    return null;
}


