import * as url from "url";

export class RequestData {
    readonly    url:            string;
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
    const contentLength = data.headers["content-length"];
    const contentType   = data.headers["content-type"];

    const info = `${data.status} ${data.statusText} • length ${contentLength} • ${contentType} • ${data.executionTime} ms`;
    return info;
}

export const globalResponseMap: { [key: string]: ResponseData } = {};

export class RequestHeaders {
    readonly    "Content-Type": string;
    readonly    "Connection":   string;
}

export class PostClientConfig {
    readonly    endpoint:       string;
    readonly    headers:        RequestHeaders;
    readonly    responseFolder?: string;
}

export const configFileName  =".post-client.json";