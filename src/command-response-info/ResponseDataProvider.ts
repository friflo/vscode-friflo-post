// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';

// became obsolete - keep it in case a TextDocumentContentProvider is required
export default class ResponseDataProvider implements vscode.TextDocumentContentProvider, vscode.DocumentLinkProvider {

	static              scheme              = 'response-data';
	public  readonly    didChangeEmitter    = new vscode.EventEmitter<vscode.Uri>();
	private readonly    _editorDecoration   = vscode.window.createTextEditorDecorationType({ textDecoration: 'underline' });

	constructor() {	}

	dispose() {
		this._editorDecoration.dispose();
		this.didChangeEmitter.dispose();
	}

	// Expose an event to signal changes of _virtual_ documents to the editor
	get onDidChange() {
		return this.didChangeEmitter.event;
	}

	// Provider method that takes an uri of the `response-data`-scheme and
	// resolves its content by lookup in responseInfoMap
	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        // return renderResponseData(responseData);
        return "became obsolete - keep it in case a TextDocumentContentProvider is required";
	}

	provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
		return undefined;
	}
}
