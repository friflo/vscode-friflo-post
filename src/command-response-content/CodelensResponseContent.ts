// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { isConfigFile, respMdExt } from '../models/PostConfig';
import { createCodelens } from '../utils/vscode-utils';
import { Match } from '../utils/utils';

/**
 * CodelensResponseContent
 */
export class CodelensResponseContent implements vscode.CodeLensProvider
{
    private         _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses:  vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
         vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public reload() {
        this._onDidChangeCodeLenses.fire();
    }

    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {        
        if (!vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            return [];
        }
        const fileName = document.fileName;
        const isConfig = isConfigFile(fileName);
        if (isConfig)
            return [];
        if (!fileName.endsWith(respMdExt))
            return [];
        // find the corresponding content file (*.resp.md.json) for the given *.resp.md file
        const respContentPath = await findContentFile(fileName);
        if (!respContentPath)
            return [];
        const codeLenses        = createCodelens(document);
        const codeLense     = codeLenses[0];
        codeLense.command = {
            title:      "Show response body",
            tooltip:    "Show file containing the http response body",
            command:    "vscode-friflo-post.codelensContent",
            arguments:  [respContentPath]
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

async function findContentFile (respPath: string) : Promise<string | null> {    
    const folder    = path.dirname(respPath) + "/";
    const respName  = respPath.substring(folder.length, respPath.length - respMdExt.length);
    const filter    = respName + "*";
    const list      = await fs.readdir(folder);
    for (let i = 0; i < list.length; i++) {
        const filePath = list[i];
        if (filePath.endsWith(respMdExt))
            continue;
        if (Match(filePath, filter)) {
            return folder + filePath;
        }
    }
    return null;
}

