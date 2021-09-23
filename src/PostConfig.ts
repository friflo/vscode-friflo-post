import * as minimatch  from "minimatch";

export class Endpoint {
    readonly    fileMatch:      string[];
    readonly    url:            string;
    readonly    "Content-Type"?:string;
}

export class RequestHeaders {
    readonly    "Connection"?:  string;
    readonly    "Content-Type"?:string;
}

export class ResponseConfig {
    readonly    folder:         string;
    readonly    ext:            string;
}

export class PostConfig {
    readonly    endpoints:      Endpoint[];
    readonly    headers:        RequestHeaders;
    readonly    response:       ResponseConfig;
}

export const standardContentTypes : { [ext: string] : string} = {
    ".json": "application/json"
};

export const defaultConfigString = `{
  "endpoints": [
    { "fileMatch": ["*.json"], "url": "http://localhost:8080/" }
  ],
  "headers": {
    "Connection":   "Keep-Alive"
  },
  "response": {
    "folder":       "response",
    "ext":          ".resp"
  }
}`;

export const defaultConfig : PostConfig = JSON.parse(defaultConfigString);

export function getEndpoint(config: PostConfig, filePath: string) : Endpoint | null {
    
    for (const endpoint of config.endpoints) {
        for (const fileMatch of endpoint.fileMatch) {
            if (minimatch(filePath, fileMatch, { matchBase: true })) {
                return endpoint;
            }
        }
    }
    return null;
}

export const configFileName  =".post";