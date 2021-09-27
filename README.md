#           **_friflo_ __POST__**

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version-short/friflo.vscode-friflo-post.svg)](https://marketplace.visualstudio.com/items?itemName=friflo.vscode-friflo-post)


## Features
*   Send files in your workspace like JSON or XML via HTTP __POST__, __PUT__ & __PATCH__ with a single click on a __CodeLens__ button.  
    E.g. `say-hello.test.json`
*   Store HTTP responses like JSON or XML _automatically_ as files  in the workspace.  
    E.g. `say-hello.test.resp.json`
*   Store HTTP request / response header _automatically_ as a __markdown__ file in the workspace.  
    E.g. `say-hello.test.resp.md`
*   Enables using VSCode language validators like __JSON Schema__ on request and response files.  
*   Show and edit HTTP response directly in a separate workspace editor tab.
*   Toggle between response and headers with a single click in the editor tab.  
    E.g. toggle between `say-hello.test.resp.json` & `say-hello.test.resp.md`
*   Enables using other utilities like __node__ processing request & response files as they are __valid__ JSON or XML
*   Enables using __git__ as a simple regression test to compare response bodies and headers with previous requests.
*   Enables configuration via the config file `.post-config` for all request files in a folder to:
    *   set the http `endpoints` and specific http `headers`
    *   set the `response` folder for response files.

## Usage

The screen recording (one minute) below show the entire workflow.  
*   Using __Context menu > POST Request__ to create `.post-config` file and adjust the `endpoint` url
*   Click the __POST__ button on top of the JSON file and toggle in the response tab between response body (JSON) and headers
*   Demonstrate [__JSON Schema validation__](https://code.visualstudio.com/docs/languages/json#_mapping-to-a-schema-in-the-workspace)
of JSON request & response files.
*   Execute a second request with a single click using the configuration from the beginning.
*   Execute a third request - this time __PUT__ - to show the error case when the server is not responding.  
    The request is canceled by clicking on the progress indicator in the status bar.
*   Use __VSCode Source Control__ to show the diff of the response info with a previous successful request.

![](https://raw.githubusercontent.com/friflo/vscode-friflo-post/master/docs/friflo-POST.gif)

