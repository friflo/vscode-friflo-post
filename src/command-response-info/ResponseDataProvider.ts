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
        const req = responseData.requestData;
        let requestHeaders = "";
        for (const header in req.headers) {
            requestHeaders += `${header}: ${req.headers[header]}\n`;
        }
        const request = `request #${req.requestSeq} ${responseData.executionTime} ms

${req.type} ${req.url}
${requestHeaders}`;        
        const res = responseData.httpResponse;
        if (res.responseType == "error") {
            return `${res.message}\n\n${request}`;
        }
        let responseHeaders = "";
        for (let n = 0; n < res.rawHeaders.length; n++) {
            const header = res.rawHeaders[n];
            if (n % 2 == 0) {
                responseHeaders += header;
            } else {
                responseHeaders += `: ${header}\n`;
            }
        }
        return `${request}
HTTP/${res.httpVersion} ${res.status} ${res.statusText}
${responseHeaders}`;
	}

	provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] | undefined {
		return undefined;
	}
}
