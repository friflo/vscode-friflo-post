// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace, Uri } from 'vscode';
import { CodelensRequest } from './command-request/CodelensRequest';
import { CodelensResponseInfo } from './command-response-info/CodelensResponseInfo';
import { executeRequest } from './command-request/executeRequest';
import { executeResponseInfoPost } from './command-response-info/executeResponseInfo';
import ContentProvider, { } from './command-response-info/ResponseDataProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    const codelensRequestPost       = new CodelensRequest     ('POST', "vscode-friflo-post.codelensPost");
    const codelensRequestPut        = new CodelensRequest     ('PUT',  "vscode-friflo-post.codelensPut");

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
        const result = await executeRequest("POST", args);
        if (!result)
            return;
        provider.didChangeEmitter.fire(result.requestData.vscodeUri!);
    });

    commands.registerCommand("vscode-friflo-post.codelensPut", async (args: any) => {
        const result = await executeRequest("PUT", args);
        if (!result)
            return;
        provider.didChangeEmitter.fire(result.requestData.vscodeUri!);
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
        const responseFile  = args;
        const uri           = Uri.parse("response-data:" + responseFile);
        await executeResponseInfoPost(uri);
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
