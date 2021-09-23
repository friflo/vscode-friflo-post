import * as vscode from 'vscode';
import { RequestType } from './commands';
import { addRequestCommand, resolveRequestCommand as resolveRequestCommand } from './utils';

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
        return await addRequestCommand(document, this.commandName);
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        return resolveRequestCommand(codeLens, this.commandName);
    }
}

