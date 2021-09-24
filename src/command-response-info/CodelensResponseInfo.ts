// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';
import { getInfo, globalResponseMap, RequestType } from '../models/RequestData';
import { createCodelens, getWorkspacePath } from '../utils/vscode-utils';

/**
 * CodelensResponseInfoPost
 */
export class CodelensResponseInfo implements vscode.CodeLensProvider
{
    private         _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses:  vscode.Event<void> = this._onDidChangeCodeLenses.event;
    public readonly requestType: RequestType;

    constructor(requestType: RequestType) {
        this.requestType    = requestType;
         vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    /**
     * Compute a list of [lenses](#CodeLens). This call should return as fast as possible and if
     * computing the commands is expensive implementors should only return code lens objects with the
     * range set and implement [resolve](#CodeLensProvider.resolveCodeLens)
     */
    public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken):  Promise<vscode.CodeLens[]>
    {
        if (!vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)){
            return [];
        }
        const fileName  = getWorkspacePath(document.fileName)!;
        const info = globalResponseMap[fileName];
        if (info) {
            const codeLenses = createCodelens(document);
            const infoStr = getInfo(info);
            // Set codeLenses command directly - its fast. So resolveCodeLens() will no be called.
            codeLenses[0].command = {
                title:      infoStr,
                command:    "vscode-friflo-post.codelensInfo",
                tooltip:    "Show HTTP response headers",
                arguments:  [fileName]
            };
            return codeLenses;
        }    
        return [];
    }

    /**
     * This function will be called for each visible code lens, usually when scrolling and after
     * calls to [compute](#CodeLensProvider.provideCodeLenses)-lenses.
     */
    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (!vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
            return null;
        }
        /* const infoStr = (codeLens as any)["infoStr"] as string;
        codeLens.command = {
            title:      infoStr,
            tooltip:    "Show HTTP response headers",
            command:    "vscode-friflo-post.codelensInfo",
            arguments:  ["Argument 1", false]
        }; */
        return codeLens;
    }
}

