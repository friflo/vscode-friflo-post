// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as url from "url";
import { promises as fs } from 'fs';
import { window } from "vscode";

export type RequestType = "POST" | "PUT";

export class RequestData {
    readonly    url:            string;
    readonly    destPathTrunk:  string;
    readonly    type:           RequestType;
    readonly    requestSeq:     number;
    readonly    headers:        any;
}

export abstract class HttpResponse {
    readonly abstract responseType:"result" | "error" ;
}

export class HttpResult extends HttpResponse {
    readonly    responseType:      "result";
    readonly    status:             number;
    readonly    statusText:         string;
    readonly    content:            string;
    readonly    headers:            any;
    readonly    rawHeaders:         string[];
    readonly    httpVersion:        string;
}

export class HttpError extends HttpResponse {
    readonly    responseType:      "error";
    readonly    message:            string;
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

export class RespInfo {
    readonly    path:       string;
    readonly    info:       string;
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
    if (res.responseType == "result") {
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

export async function GetFileContent(...args: any[]) : Promise<FileContent | null> {
    const selectedFilePath = args && args[0] && args[0][0] ? args[0][0].fsPath : null;
    if (selectedFilePath) {
        const selectedFilePath = args[0][0].fsPath;
        const content       = await fs.readFile(selectedFilePath,'utf8');
        return {
            path:       selectedFilePath,
            content:    content
        };
    }
    const editor = window.activeTextEditor;
    if (!editor) {
        return null;
    }
    return {
        path:       editor.document.fileName,
        content:    editor.document.getText()
    };
}

export function renderResponseData(responseData: ResponseData) {
    const info = getInfo(responseData);
    const req = responseData.requestData;
    let requestHeaders = "";
    for (const header in req.headers) {
        requestHeaders += `${header}: ${req.headers[header]}\n`;
    }
    const request   = `${req.type} ${req.url}\n${requestHeaders}`;
    const res       = responseData.httpResponse;
    if (res.responseType == "error") {
        return `no content\n
${info}\n
${request}`;
    }
    let responseHeaders = "";
    for (let n = 0; n < res.rawHeaders.length; n++) {
        const header = res.rawHeaders[n];
        if (n % 2 == 0) {
            responseHeaders += header;
        } else {
            responseHeaders += `: ${header}\n`;
        }
    }
    return `${info}\n
${request}
HTTP/${res.httpVersion} ${res.status} ${res.statusText}
${responseHeaders}`;
}

