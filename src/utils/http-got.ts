// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

// import * as http from 'http';
// import * as https from 'https';
import got, { CancelableRequest, HTTPError, RequestError, OptionsOfTextResponseBody, Response } from 'got';
// import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { HttpResult, RequestData, ResponseData } from '../models/RequestData';
import { CreateRequest, RequestBase } from '../models/RequestBase';
import { getExtensionFromContentType } from './standard-content-types';

/*
const axiosInstance = axios.create({
    // 60 sec timeout
    timeout: 60 * 1000,
  
    // keepAlive pools and reuses TCP connections, so it's faster
    httpAgent:  new http.Agent ({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    
    //follow up to 3 HTTP 3xx redirects
    maxRedirects: 3,
    
    // cap the maximum content length we'll accept to 50MBs, just in case
    maxContentLength: 50 * 1000 * 1000
  });
*/


export const createGotRequest: CreateRequest = function (requestData: RequestData) : RequestBase {
    const options: OptionsOfTextResponseBody = {
        headers:    requestData.headers,
        body:       requestData.requestBody,
        timeout:    60_000
    };
    let cancelableRequest: CancelableRequest<Response<string>>;
    switch (requestData.type) {
        case "POST":
            cancelableRequest = got.post(requestData.url, options);
            break;
        case "PUT":
            cancelableRequest = got.put(requestData.url, options);
            break;
        default:
            throw "Unsupported request type: " + requestData.type;
    }
    const request = new GotRequest(requestData, cancelableRequest);
    return request;
};

export class GotRequest extends RequestBase {
    readonly request:       CancelableRequest<Response<string>>;

    constructor(requestData: RequestData, request: CancelableRequest<Response<string>>) {
        super(requestData);
        this.request = request;
    }

    async executeHttpRequest() : Promise<ResponseData> {
        const requestData   = this.requestData;
        const startTime     = new Date().getTime();

        try {
            const res           = await this.request;
            const executionTime = new Date().getTime() - startTime;        
            // console.log(res.headers, `${executionTime} ms`);
            return {
                requestData:    requestData,
                httpResponse:   getHttpResult(res),
                path:           getPath(res, requestData),
                executionTime:  executionTime,
            };
        }
        catch (e: any) {
            const executionTime = new Date().getTime() - startTime;
            const err: HTTPError = e;
            const res = err.response;
            if (res) {
                return {
                    requestData:    requestData,
                    httpResponse:   getHttpResult(res),
                    path:           getPath(res, requestData),
                    executionTime:  executionTime,
                };
            }
            const err2: RequestError = e;
            const message = err.name == "CancelError" ? "request canceled" : err2.message;
            return {
                requestData:    requestData,
                httpResponse: {
                    responseType:   "error",
                    message:        message
                },
                path:               requestData.destPathTrunk,
                executionTime:      executionTime,
            };      
        }
    }

    cancelRequest() : void {
        this.request.cancel();
    }
}

function getPath(res: Response, requestData:   RequestData) : string {
    const contentType = res.headers["content-type"]; // todo casing
    if (!contentType) {
        return requestData.destPathTrunk;
    }
    const ext   = getExtensionFromContentType(contentType);
    const path  = requestData.destPathTrunk + ext;
    return path;
}

function  getHttpResult(res: Response) : HttpResult {
    return {
        responseType:  "result",
        status:         res.statusCode,
        statusText:     res.statusMessage!,
        content:        res.body as string,
        headers:        res.headers,
        rawHeaders:     res.rawHeaders,
        httpVersion:    res.httpVersion
    };
}
