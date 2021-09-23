import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';
import { getInfo, globalResponseMap, RequestType } from './RequestData';
import { getConfigPath, getEndpoint, isConfigFile, parseConfig } from './PostConfig';
import { standardContentTypes } from './standardContentTypes';

const firstCharRegEx = /[^\s\\]/;

export function createCodelens(document: vscode.TextDocument) : vscode.CodeLens[] {
    const codeLenses:  vscode.CodeLens[] = [];
    const text = document.getText();
    const firstChar = firstCharRegEx;			
    const matches = firstChar.exec(text);
    if (matches) {
        const line      = document.lineAt(document.positionAt(matches.index).line);
        const position  = new vscode.Position(line.lineNumber, 0);
        const range     = document.getWordRangeAtPosition(position,firstChar);
        if (range) {
            codeLenses.push(new vscode.CodeLens(range));
        }
    }
    return codeLenses;
}

// ------------------------------ request: POST
export async function addRequestCommand(document: vscode.TextDocument, requestType: RequestType) : Promise<vscode.CodeLens[]>{
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
            if (requestType == "POST") {
                (entry as any)["endpoint"]  = endpoint?.url;
            }
            (entry as any)["requestType"]   = requestType;
            return codeLenses;
        }
        catch (err) { 
            // ignore
        }
    }
    return [];
}

export function resolveRequestCommand(codeLens: vscode.CodeLens, commandName: string) : vscode.CodeLens | null {
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
            command:    "vscode-friflo-post." + commandName,
            // arguments: ["Argument 1", false]
        };
        return codeLens;
    }
    return null;
}

// ------------------------------ response info
export async function addResponseInfoCommand(document: vscode.TextDocument) : Promise<vscode.CodeLens[]>{
    if (vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
        const fileName  = path.normalize(document.fileName);
        const responseMap = globalResponseMap;
        const info = responseMap[fileName];
        if (info) {
            const codeLenses = createCodelens(document);
            const infoStr = getInfo(info);
            const entry = codeLenses[0];
            (entry as any)["infoStr"] = infoStr;                    
            return codeLenses;
        }    
        //}
    }
    return [];
}

export function resolveResponseInfoCommand(codeLens: vscode.CodeLens, commandName: string) : vscode.CodeLens | null {
    if (vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
        const infoStr = (codeLens as any)["infoStr"] as string;
        codeLens.command = {
            title:      infoStr,
            tooltip:    "Show HTTP response headers",
            command:    "vscode-friflo-post." + commandName,
            // arguments:  ["Argument 1", false]
        };
        return codeLens;
    }
    return null;
}