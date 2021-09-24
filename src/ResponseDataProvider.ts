// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';


export default class ResponseDataProvider implements vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider {

	static scheme               = 'response-data';
	private _onDidChange        = new vscode.EventEmitter<vscode.Uri>();
	private _editorDecoration   = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });

	constructor() {	}

	dispose() {
		this._editorDecoration.dispose();
		this._onDidChange.dispose();
	}

	// Expose an event to signal changes of _virtual_ documents to the editor
	get onDidChange() {
		return this._onDidChange.event;
	}

	// Provider method that takes an uri of the `response-data`-scheme and
	// resolves its content by lookup in globalResponseMap
	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        return "Hello-World - uri:" + uri.path;
	}

	provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
		return undefined;
	}
}
