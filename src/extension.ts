// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace } from 'vscode';
import { CodelensRequest, getConfigOf } from './command-request/CodelensRequest';
import { CodelensResponseInfo } from './command-response-info/CodelensResponseInfo';
import { executeRequest } from './command-request/executeRequest';
import { executeResponseInfo } from './command-response-info/executeResponseInfo';
import ContentProvider, { } from './command-response-info/ResponseDataProvider';
import { CodelensResponseContent } from './command-response-content/CodelensResponseContent';
import { executeResponseContent } from './command-response-content/executeResponseInfo';
import { getEndpoint } from './models/PostConfig';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    const codelensRequestPost       = new CodelensRequest           ('POST', "vscode-friflo-post.codelensPost");
    // const codelensRequestPut        = new CodelensRequest           ('PUT',  "vscode-friflo-post.codelensPut");
    const codelensResponseContent   = new CodelensResponseContent   ();

    const codelensResponseInfoPost  = new CodelensResponseInfo('POST');

    languages.registerCodeLensProvider("*", codelensRequestPost);
    // languages.registerCodeLensProvider("*", codelensRequestPut);
    languages.registerCodeLensProvider("*", codelensResponseContent);

    languages.registerCodeLensProvider("*", codelensResponseInfoPost);

    commands.registerCommand("vscode-friflo-post.enablePostClient", () => {
        workspace.getConfiguration("vscode-friflo-post").update("enablePostClient", true, true);
    });

    commands.registerCommand("vscode-friflo-post.disablePostClient", () => {
        workspace.getConfiguration("vscode-friflo-post").update("enablePostClient", false, true);
    });

    commands.registerCommand("vscode-friflo-post.codelensPost", async (args: any) => {
        const result = await executeRequest("POST", args);
        codelensResponseContent.reload();
        if (!result)
            return;
        // provider.didChangeEmitter.fire(result.requestData.infoUri);
    });

    commands.registerCommand("vscode-friflo-post.codelensPut", async (args: any) => {
        const result = await executeRequest("PUT", args);
        if (!result)
            return;
        // provider.didChangeEmitter.fire(result.requestData.infoUri);
    });

    commands.registerCommand("vscode-friflo-post.codelensContent", async (args: any) => {
        await executeResponseContent(args);
    });

    commands.registerCommand("vscode-friflo-post.codelensInfo", async (args: any) => {
        await executeResponseInfo(args);
        // commands.executeCommand("vscode-friflo-post.showInfo", args);
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
	/* const commandRegistration = commands.registerTextEditorCommand("vscode-friflo-post.showInfo", async(editor, edit, args) => {
        const responseFile  = args;
        const uri           = Uri.parse("response-data:" + responseFile);
        await executeResponseInfo(uri);
	}); */

	context.subscriptions.push(
		provider,
		// commandRegistration,
		providerRegistrations
	);
    workspace.onDidOpenTextDocument (async (document) => {     
        const path = document.fileName;
        const config = await getConfigOf(path);
        if (!config)
            return;
        const endpoint = getEndpoint(config, path);
        if (!endpoint)
            return;
        // console.log("did open", document.fileName);
        openForPost[path] = true;
        commands.executeCommand('setContext', 'vscode-friflo-post.openForPost', openForPost);
    });

    workspace.onDidCloseTextDocument ((document) => {
        const path = document.fileName;
        if (openForPost[path]) {
            // console.log("did open", document.fileName);
            delete openForPost[path];
            commands.executeCommand('setContext', 'vscode-friflo-post.openForPost', openForPost);
        }
    });
}

const openForPost : { [key: string] : true} = {};

// this method is called when your extension is deactivated
export function deactivate() {
    if (disposables) {
        disposables.forEach(item => item.dispose());
    }
    disposables = [];
}
