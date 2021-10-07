#           _friflo_ __POST__

[![Marketplace Version](https://vsmarketplacebadge.apphb.com/version-short/friflo.vscode-friflo-post.svg)](https://marketplace.visualstudio.com/items?itemName=friflo.vscode-friflo-post) [![CodeQL](https://github.com/friflo/vscode-friflo-post/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/friflo/vscode-friflo-post/actions/workflows/codeql-analysis.yml)


## Goal
Main goal of this extension is storing all HTTP request & response data _automatically_ as files in a __VSCode workspace__.  
This ensures these files are still available in new VSCode sessions.
It also enables utilizing __VSCode build-in tools__ for request & response files.
E.g. [__JSON Schema validation__](https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings)
of JSON request & response files, storing them in __git__ and comparing subsequent response results with previous ones in
[__VSCode Diff Viewer__](https://code.visualstudio.com/docs/editor/versioncontrol#_viewing-diffs).

[GitHub repository link](https://github.com/friflo/vscode-friflo-post/)


## Features
*   Send files in your workspace like JSON or XML via HTTP __POST__, __PUT__ & __PATCH__ with a single click on a __CodeLens__ button.  
    E.g. `say-hello.test.json`
*   Store HTTP responses like JSON or XML _automatically_ as files  in the workspace.  
    E.g. `say-hello.test.resp.json`
*   Store HTTP request / response header _automatically_ as a __markdown__ file in the workspace.  
    E.g. `say-hello.test.resp.md`
*   Enables utilizing __VSCode language validators__ like __JSON Schema__ to provide __Code Completion__ and __validation__
    for request and response files.  
*   Show and edit HTTP response directly in a separate workspace editor tab.
*   Toggle between response body and headers with a single click in the editor tab.  
    E.g. toggle between `say-hello.test.resp.json` & `say-hello.test.resp.md`
*   Enables using other utilities like __node__ processing request & response files as they are __valid__ JSON or XML
*   Enables using __git__ as a simple regression test to compare response bodies and headers with previous requests.
*   Enables configuration via the config file `.post-config` for all request files in a folder to:
    *   set the http `"endpoints"` and specific http `"headers"`
    *   set the `"response"` `"folder"` for response files.
    *   set `"variables"` used to replace their occurrences in the request body. E.g. `"user":   "{{user}}",`
*   __Code Completion__ and __validation__ for config file in VSCode editor.
*   If a request file - e.g. `my-request.json` - is in a folder without a `.post-config` executing
    __friflo POST: POST Request__ from _View > Command Palette..._ will ask to create an initial `.post-config`.

`.post-config` example    
```json
{
  "endpoints": [
    { "fileMatch": ["*.json"], "url": "http://localhost:8010/" }
  ],
  "headers":   {
    "Connection":   "Keep-Alive"
  },
  "response":  {
    "folder":       "response"
  },
  "variables": {
    "{{user}}":     "admin",
    "{{token}}":    "admin-token"
  }
}
```

## Usage

The screen recording (one minute) below show the entire workflow.  
*   Using __Context menu > POST Request__ to create `.post-config` file and adjust the `endpoint` url
*   Click the __POST__ button on top of the JSON file and toggle in the response tab between response body (JSON) and headers
*   Demonstrate [__JSON Schema validation__](https://code.visualstudio.com/docs/languages/json#_mapping-to-a-schema-in-the-workspace)
of JSON request & response files.
*   Execute a second request with a single click using the configuration from the beginning.
*   Execute a third request - this time __PUT__ - to show the error case when the server is not responding.  
    The request is canceled by clicking on the _progress indicator_ in the status bar.
*   Use __VSCode Source Control__ to show the diff of the response info with a previous successful request.

[![Usage - screen recording](https://raw.githubusercontent.com/friflo/vscode-friflo-post/master/docs/friflo-POST.gif)](https://raw.githubusercontent.com/friflo/vscode-friflo-post/master/docs/friflo-POST.gif)


## Tips

* As every request file generate two response files e.g. `test.resp.json` and `test.resp.md` in the `response` folder
it may be desired to hide them in the __EXPLORER__ panel. To do this add the section below to `.vscode/settings.json`.

```json
{
    "settings": {
        "files.exclude": {
            "**/response/*.resp.json": true,
            "**/response/*.resp.md":   true
        }
    }
}

```


## License
[MIT License](LICENSE)


## Feedback
As this project is very young GitHub issue reports are welcome!  
First commit: 2021-09-22. Published in VSCode Marketplace: 2021-09-26.  
[GitHub Issues](https://github.com/friflo/vscode-friflo-post/issues)

