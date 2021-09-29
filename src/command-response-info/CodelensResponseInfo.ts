// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { respExt, respMdExt } from '../models/PostConfig';
import { RequestType, RespInfo } from '../models/RequestData';
import { createCodelens } from '../utils/vscode-utils';

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
        const respInfo  = await findRespFile(document.fileName)!;
        if (!respInfo)
            return [];
        const codeLenses = createCodelens(document);
        // Set codeLenses command directly - its fast. So resolveCodeLens() will no be called.
        codeLenses[0].command = {
            title:      respInfo.info,
            command:    "vscode-friflo-post.codelensInfo",
            tooltip:    "Show response information",
            arguments:  [respInfo.path]
        };
        return codeLenses;
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

async function findRespFile (contentPath: string) : Promise<RespInfo | null> {
    const basename      = path.basename(contentPath);
    const respIndex     = basename.lastIndexOf(respExt);
    if (respIndex == -1)
        return null;
    // End basename with ".resp.md" ?
    if (basename.indexOf(respMdExt, respIndex) != -1)
        return null;
    const trunk         = contentPath.substring(0, contentPath.length - basename.length + respIndex);
    const respInfoPath  = trunk + respMdExt;
    const titleLine     = await getTitleLine (respInfoPath);
    // const status = getStatus(titleLine);
    // const icon = status == null ? "❌" : ((200 <= status && status < 300) ? "✔️" : "😕");
    return {
        path: respInfoPath,
        info: `${titleLine}`
    };   
}

async function getTitleLine (respInfoPath: string) : Promise<string | null> {
    try {
        const info      = await fs.readFile(respInfoPath,'utf8');
        const lines     = info.split("\n");
        for (let n = 0; n < lines.length; n++) {
            const line = lines[n];
            if (line.trim().length == 0)
                continue;
            return line;
        }
    }
    catch (err) {
        // cannot create a title => null
    } 
    return null;
}
/*
function getStatus (str: string) : number | null {
    if (str.length < 3)
        return null;
    const d0 = digit(str, 0);
    const d1 = digit(str, 0);
    const d2 = digit(str, 0);
    if (d0 === null || d1 === null || d2 == null)
        return null;
    return d0 * 100 + d1 * 10 * d2;
}

function digit (str: string, index: number) : number | null {
    const codePoint = str.codePointAt(index);
    if (codePoint == null)
        return null;
    const digit = codePoint - 48;
    if (digit < 0 || digit > 9)
        return null;
    return digit;
}
*/