// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace } from 'vscode';
import { CodelensRequest } from './CodelensRequest';
import { CodelensResponseInfo } from './CodelensResponseInfo';
import { executeRequest } from './executeRequest';
import { executeResponseInfoPost } from './executeResponseInfo';
import ContentProvider, { } from './ResponseDataProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    const codelensRequestPost       = new CodelensRequest     ('POST', "codelensPost");
    const codelensRequestPut        = new CodelensRequest     ('PUT',  "codelensPut");

    const codelensResponseInfoPost  = new CodelensResponseInfo('POST');

    languages.registerCodeLensProvider("*", codelensRequestPost);
    languages.registerCodeLensProvider("*", codelensRequestPut);

    languages.registerCodeLensProvider("*", codelensResponseInfoPost);

    commands.registerCommand("vscode-friflo-post.enablePostClient", () => {
        workspace.getConfiguration("vscode-friflo-post").update("enablePostClient", true, true);
    });

    commands.registerCommand("vscode-friflo-post.disablePostClient", () => {
        workspace.getConfiguration("vscode-friflo-post").update("enablePostClient", false, true);
    });

    commands.registerCommand("vscode-friflo-post.codelensPost", async (args: any) => {
        await executeRequest("POST", args);
    });

    commands.registerCommand("vscode-friflo-post.codelensPut", async (args: any) => {
        await executeRequest("PUT", args);
    });

    commands.registerCommand("vscode-friflo-post.responseInfo", async (args: any[]) => {
        commands.executeCommand("vscode-friflo-post.showInfo", args);
    });

    // ----- TextDocumentContentProvider
    // [Virtual Documents | Visual Studio Code Extension API]
    //   https://code.visualstudio.com/api/extension-guides/virtual-documents
    // [vscode-extension-samples/virtual-document-sample at main · microsoft/vscode-extension-samples]
    //   https://github.com/microsoft/vscode-extension-samples/tree/main/virtual-document-sample
    const provider = new ContentProvider();

	// register content provider for scheme `response-data`
	// register document link provider for scheme `response-data`
	const providerRegistrations = Disposable.from(
		workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider),
		languages.registerDocumentLinkProvider({ scheme: ContentProvider.scheme }, provider)
	);

	// register command that crafts an uri with the `response-data` scheme,
	// open the dynamic document, and shows it in the next editor
	const commandRegistration = commands.registerTextEditorCommand("vscode-friflo-post.showInfo", async(editor, edit, args) => {
        await executeResponseInfoPost(args);
	});

	context.subscriptions.push(
		provider,
		commandRegistration,
		providerRegistrations
	);
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (disposables) {
        disposables.forEach(item => item.dispose());
    }
    disposables = [];
}
