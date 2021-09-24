// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as vscode from 'vscode';
import { globalResponseMap } from '../models/RequestData';


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
	// resolves its content by lookup in globalResponseMap
	provideTextDocumentContent(uri: vscode.Uri): string | Thenable<string> {
        const responseDataFile  = uri.path;
        const responseData      = globalResponseMap[responseDataFile];
        if (!responseData) {
            return "ResponseInfo not found: " + responseDataFile;
        }
        const res = responseData.httpResponse;
        if (res.httpType == "result") {            
            let headers = "";
            for (let n = 0; n < res.rawHeaders.length; n++) {
                const header = res.rawHeaders[n];
                if (n % 2 == 0) {
                    headers += header;
                } else {
                    headers += `: ${header}\n`;
                }
            }            
            return `HTTP/${res.httpVersion} ${res.status} ${res.statusText}\n${headers}`;
        }
        return res.message;
	}

	provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
		return undefined;
	}
}
