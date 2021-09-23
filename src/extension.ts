// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace } from 'vscode';
import { CodelensPost } from './CodelensPost';
import { CodelensResponseInfoPost } from './CodelensResponseInfoPost';
import { executePost, executeResponseInfoPost } from './commands';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    const codelensProvider      = new CodelensPost();
    const codelensResponseInfo  = new CodelensResponseInfoPost();

    languages.registerCodeLensProvider("*", codelensProvider);
    languages.registerCodeLensProvider("*", codelensResponseInfo);

    commands.registerCommand("vscode-friflo-post.enablePostClient", () => {
        workspace.getConfiguration("vscode-friflo-post").  update("enablePostClient", true, true);
        workspace.getConfiguration("vscode-response-info").update("enablePostClient", true, true);
    });

    commands.registerCommand("vscode-friflo-post.disablePostClient", () => {
        workspace.getConfiguration("vscode-friflo-post").  update("enablePostClient", false, true);
        workspace.getConfiguration("vscode-response-info").update("enablePostClient", false, true);
    });

    commands.registerCommand("vscode-friflo-post.codelensPost", async (args: any) => {
        await executePost("POST", args);
    });

    commands.registerCommand("vscode-friflo-post.responseInfo", async (args: any) => {
        await executeResponseInfoPost(args);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (disposables) {
        disposables.forEach(item => item.dispose());
    }
    disposables = [];
}
