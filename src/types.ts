import * as url from "url";
import * as minimatch  from "minimatch";


export class RequestData {
    readonly    url:            string;
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

export class RequestHeaders {
    readonly    "Content-Type": string;
    readonly    "Connection":   string;
}

export class ResponseConfig {
    readonly    folder:         string = ""
    readonly    ext:            string;
}

export class PostClientConfig {
    readonly    endpoints:      { [key: string]: string };
    readonly    headers:        RequestHeaders;
    readonly    response:       ResponseConfig;
}

export const defaultConfig : PostClientConfig = {
    endpoints:    { "*.json": "http://localhost:8080/" } ,
    headers: {
        "Content-Type": "application/json",
        "Connection":   "Keep-Alive"
    },
    response: {
        folder: "response",
        ext:    "",
    }
};

export function getEndpoint(config: PostClientConfig, filePath: string) : string | null {
    
    for (const matcher in config.endpoints) {
        if (minimatch(filePath, matcher, { matchBase: true })) {
            return config.endpoints[matcher];
        }
    }
    return null;
}

export const configFileName  =".post";