import * as vscode from 'vscode';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

    private codeLenses: vscode.CodeLens[] = [];
    private firstChar: RegExp;

    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

    constructor() {
        this.firstChar= /[^\s\\]/;

        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }

    public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {

        if (vscode.workspace.getConfiguration("vscode-post-client").get("enableCodeLens", true)) {
            this.codeLenses = [];
			const text = document.getText();
			const firstChar = new RegExp(this.firstChar);			
			const matches = firstChar.exec(text);
			if (matches) {
				const line      = document.lineAt(document.positionAt(matches.index).line);
				const position  = new vscode.Position(line.lineNumber, 0);
				const range     = document.getWordRangeAtPosition(position,firstChar);
				if (range) {
					this.codeLenses.push(new vscode.CodeLens(range));
				}
			}
            return this.codeLenses;
        }
        return [];
    }

    public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
        if (vscode.workspace.getConfiguration("vscode-post-client").get("enableCodeLens", true)) {
            codeLens.command = {
                title: "Post",
                tooltip: "Tooltip provided by sample extension",
                command: "vscode-post-client.codelensPost",
                arguments: ["Argument 1", false]
            };
            return codeLens;
        }
        return null;
    }
}

