// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';
import { globalResponseMap } from '../models/RequestData';


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
        const responseDataFile  = uri.path;
        const responseData      = globalResponseMap[responseDataFile];
        const headers           = JSON.stringify(responseData.headers, null, 4);

        return `HTTP/1.1 200 OK
Date: Sat, 16 May 2020 10:45:13 GMT
Server: Apache
Last-Modified: Mon, 27 Apr 2020 11:00:44 GMT
Accept-Ranges: bytes
Content-Length: 16209
Content-Type: text/html
Cache-Control: maxe-age=180
eTag: "x26e3"
Set-Cookie: id=dlvbhd32; Expires=Tue, 13 Oct 2020 00:00:00 GMT`;
	}

	provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
		return undefined;
	}
}
