// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext, languages, commands, Disposable, workspace } from 'vscode';
import { CodelensProvider } from './CodelensProvider';
import { CodelensProviderResponseInfo } from './CodelensProviderResonseInfo';
import { codelensPost, responseInfo } from './commands';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let disposables: Disposable[] = [];

export function activate(context: ExtensionContext) {
    const codelensProvider      = new CodelensProvider();
    const codelensResponseInfo  = new CodelensProviderResponseInfo();

    languages.registerCodeLensProvider("*", codelensProvider);
    languages.registerCodeLensProvider("*", codelensResponseInfo);

    commands.registerCommand("vscode-post-client.enableCodeLens", () => {
        workspace.getConfiguration("vscode-post-client").  update("enableCodeLens", true, true);
        workspace.getConfiguration("vscode-response-info").update("enableCodeLens", true, true);
    });

    commands.registerCommand("vscode-post-client.disableCodeLens", () => {
        workspace.getConfiguration("vscode-post-client").  update("enableCodeLens", false, true);
        workspace.getConfiguration("vscode-response-info").update("enableCodeLens", false, true);
    });

    commands.registerCommand("vscode-post-client.codelensPost", async (args: any) => {
        await codelensPost(args);
    });

    commands.registerCommand("vscode-post-client.responseInfo", async (args: any) => {
        await responseInfo(args);
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    if (disposables) {
        disposables.forEach(item => item.dispose());
    }
    disposables = [];
}
