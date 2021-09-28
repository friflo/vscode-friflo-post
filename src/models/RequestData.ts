// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as url from "url";
import { promises as fs } from 'fs';
import * as path from 'path';
import { window } from "vscode";

export type RequestType = "POST" | "PUT";

export class RequestData {
    readonly    url:            string;
    readonly    requestBody:    string;
    readonly    requestPath:    string;    
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
    readonly    path:           string;
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

// const bt    = "`";      // backtick for markdown
// const code  = "```";    // backtick for markdown

export function getResultIcon(httpResponse: HttpResult | HttpError) : string {
    if (httpResponse.responseType == "error")
        return "🐛";    // no response
    if (httpResponse.status == 200)
        return "🙂";    // success
    return "😕";        // error
}

export function getResultText(httpResponse: HttpResult | HttpError) : string {
    if (httpResponse.responseType == "error")
        return "no response";
    if (httpResponse.status == 200)
        return "success";
    return "error";
}

export function renderResponseData(responseData: ResponseData) {
    const req           = responseData.requestData;
    const res           = responseData.httpResponse;
    const title         = getInfo(responseData);
    const responsePath  = path.basename(responseData.path);
    const responseLink  = res.responseType == "result" ? `\n[response](${responsePath})\n` : "";
    const requestLink   = res.responseType == "result" ? `\n[request](${getRequestLink(req)})\n` : "";
    const max           = getMaxKeyName(responseData);

    let requestHeaders = "";
    for (const header in req.headers) {
        requestHeaders += `${header}:${indent(header, max)} ${req.headers[header]}  \n`;
    }
    const request   = `${req.type} ${req.url}  \n${requestHeaders}`;
    const result    = getResultText(res) + " " + getResultIcon(res);
    if (res.responseType == "error") {
        return `${title}\n
${result}

${request}${responseLink}${requestLink}`;
    }
    let responseHeaders = "";
    for (let n = 0; n < res.rawHeaders.length; n++) {
        const header = res.rawHeaders[n];
        if (n % 2 == 0) {
            responseHeaders += `${header}: ${indent(header, max)}`;
        } else {
            responseHeaders += `${header}  \n`;
        }
    }
    return `${title}\n
${result}

${request}
HTTP/${res.httpVersion} ${res.status} ${res.statusText}  
${responseHeaders}${responseLink}${requestLink}`;
}

function indent(key: string, max: number) : string {
    return " ".repeat(max - key.length);
}

function getRequestLink(req: RequestData) : string {
    const   from    = replaceAll(path.normalize(req.destPathTrunk), "\\", "/");
    const   to      = replaceAll(path.normalize(req.requestPath),   "\\", "/");
    const   min     = Math.min(from.length, to.length);
    let     n       = 0;
    for (n = 0; n < min; n++) {
        if (from[n] != to[n])
            break;
    }
    const fromSlashes   = from.substring(n).match(/\//g)?.length ?? 0;
    const result        = "../".repeat(fromSlashes) + to.substring(n);
    return result;
}

function replaceAll(str: string, find: string, replace: string) : string {
    return str.split(find).join(replace);
}

function getMaxKeyName(responseData: ResponseData) : number {
    let max = 0;
    const req = responseData.requestData;
    for (const header in req.headers) {
        if (max < header.length)
            max = header.length;
    }
    const res = responseData.httpResponse;
    if (res.responseType == "result") {
        for (let n = 0; n < res.rawHeaders.length; n++) {
            const header = res.rawHeaders[n];
            if (n % 2 == 0) {
                if (max < header.length)
                    max = header.length;
            }
        }
    }
    return max;
}

