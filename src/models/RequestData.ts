// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as url from "url";
import { Uri } from "vscode";

export type RequestType = "POST" | "PUT";

export class RequestData {
    readonly    url:            string;
    readonly    vscodeUri:      Uri;
    readonly    type:           RequestType;
    readonly    requestSeq:     number;
    readonly    headers:        any;
}

export abstract class HttpResponse {
    readonly abstract httpType: "result" | "error" ;
}

export class HttpResult extends HttpResponse {
    readonly    httpType:      "result";
    readonly    status:         number;
    readonly    statusText:     string;
    readonly    content:        string;
    readonly    headers:        any;
    readonly    rawHeaders:     string[];
    readonly    httpVersion:    string;
}

export class HttpError extends HttpResponse {
    readonly    httpType:      "error";
    readonly    message:        string;
}

export class ResponseData {
    readonly    requestData:    RequestData;
    readonly    httpResponse:   HttpResult | HttpError;
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
    const   res     = data.httpResponse;
    let     result: string;
    if (res.httpType == "result") {
        const contentLength = res.headers && res.headers["content-length"];
        const length = contentLength ? ` • length ${contentLength}` : "";
        const status = `${res.status}${res.statusText == 'OK' ? " OK" : ""}`;
        result = `${status}${length}`;
    } else {
        result = res.message;
    }
    const info = `${result} • ${data.executionTime} ms • #${data.requestData.requestSeq}`;
    return info;
}

/** they key is the (relative) file path of the request response within the workspace */
export const globalResponseMap: { [key: string]: ResponseData } = {};

