import * as url from "url";
import * as minimatch  from "minimatch";
import { RequestType } from "./commands";


export class RequestData {
    readonly    url:            string;
    readonly    type:           RequestType;
    readonly    requestSeq:     number;
    readonly    headers:        any;
}

export class ResponseData {
    readonly    request:        RequestData;
    readonly    status:         number;
    readonly    statusText:     string;
    readonly    content:        string;
    readonly    headers:        any;
    readonly    executionTime:  number;
}

export class FileContent {
    readonly    path:       string;
    readonly    content:    string;
}

export function isPrivateIP(urlString: string) : boolean {
    const urlValue = url.parse(urlString);
    if (!urlValue.hostname)
        return false;
    if (urlValue.hostname == "localhost")
        return true;
    const parts = urlValue.hostname.split('.');
    return parts[0] === '10' || 
       (parts[0] === '172' && (parseInt(parts[1], 10) >= 16 && parseInt(parts[1], 10) <= 31)) || 
       (parts[0] === '192' && parts[1] === '168');
 }

export function getInfo (data: ResponseData ) : string {
    const contentLength = data.headers && data.headers["content-length"];
    // const contentType   = data.headers["content-type"];
    const length = contentLength ? ` • length ${contentLength}` : "";
    let status: string;
    if (data.status == 0) {
        status = data.content;
    } else {
        status = `${data.status}${data.statusText == 'OK' ? " OK" : ""}`;
    }
    const info = `${status}${length} • ${data.executionTime} ms (${data.request.requestSeq})`;
    return info;
}

export const globalResponseMap: { [key: string]: ResponseData } = {};

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

export class PostClientConfig {
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

export const defaultConfig : PostClientConfig = JSON.parse(defaultConfigString);

export function getEndpoint(config: PostClientConfig, filePath: string) : Endpoint | null {
    
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