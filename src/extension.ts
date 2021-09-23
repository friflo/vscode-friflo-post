// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace } from 'vscode';
import { CodelensRequest } from './CodelensRequest';
import { executeRequest } from './executeRequest';
import { executeResponseInfoPost } from './executeResponseInfo';
import ContentProvider, { } from './provider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    const codelensRequestPost       = new CodelensRequest     ('POST', "codelensPost");
    const codelensRequestPut        = new CodelensRequest     ('PUT',  "codelensPut");

    // const codelensResponseInfoPost  = new CodelensResponseInfo('POST', "responseInfo");

    languages.registerCodeLensProvider("*", codelensRequestPost);
    languages.registerCodeLensProvider("*", codelensRequestPut);

    // languages.registerCodeLensProvider("*", codelensResponseInfoPost);

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

    /* commands.registerCommand("vscode-friflo-post.responseInfo", async (args: any) => {
        await executeResponseInfoPost(args);
    }); */

    // ----- TextDocumentContentProvider
    const provider = new ContentProvider();

	// register content provider for scheme `references`
	// register document link provider for scheme `references`
	const providerRegistrations = Disposable.from(
		workspace.registerTextDocumentContentProvider(ContentProvider.scheme, provider),
		languages.registerDocumentLinkProvider({ scheme: ContentProvider.scheme }, provider)
	);

	// register command that crafts an uri with the `references` scheme,
	// open the dynamic document, and shows it in the next editor
	const commandRegistration = commands.registerTextEditorCommand('vscode-friflo-post.responseInfo', async(editor) => {

        await executeResponseInfoPost(editor);
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
