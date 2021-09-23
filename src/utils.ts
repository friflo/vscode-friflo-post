import * as vscode from 'vscode';
import { getConfigPath, isConfigFile, parseConfig } from './commands';
import { getEndpoint, getInfo, globalResponseMap } from './types';
import { promises as fs } from 'fs';
import * as path from 'path';

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
export async function addRequestCommand(document: vscode.TextDocument) : Promise<vscode.CodeLens[]>{
    if (vscode.workspace.getConfiguration("vscode-friflo-post").get("enablePostClient", true)) {
        const isConfig = isConfigFile(document.fileName);
        if (isConfig)
            return [];
        const configPath    = getConfigPath(document.fileName);
        try {
            const configFile    = await fs.readFile(configPath,'utf8');
            const config        = parseConfig(configFile);
            const url           = getEndpoint(config, document.fileName);
            if (url == null) {
                if (document.fileName.endsWith(".json"))
                    return createCodelens(document);
                return [];
            }
            const codeLenses    = createCodelens(document);
            const entry = codeLenses[0];
            (entry as any)["endpoint"] = url;
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
        const   endpoint    = (codeLens as any)["endpoint"] as string | null;
        let     tooltip     = `POST file content an REST API`;
        if (endpoint) {
            tooltip = `POST file content to: ${endpoint}`;
        }
        codeLens.command = {
            title:      endpoint ? `POST ${endpoint}` : "POST",
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
        //if (fileName.endsWith("response.json")) {
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