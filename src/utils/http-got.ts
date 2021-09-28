// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

// import * as http from 'http';
// import * as https from 'https';
import got, { CancelableRequest, HTTPError, RequestError, OptionsOfTextResponseBody, Response } from 'got';
// import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { HttpResponse, HttpResult, RequestData } from '../models/RequestData';
import { RequestBase } from '../models/RequestBase';

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

export function createGotRequest  (requestData: RequestData) : RequestBase {
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
}

export class GotRequest extends RequestBase {
    readonly request:       CancelableRequest<Response<string>>;

    constructor(requestData: RequestData, request: CancelableRequest<Response<string>>) {
        super(requestData);
        this.request = request;
    }

    async executeHttpRequest() : Promise<HttpResponse> {
        try {
            const res           = await this.request;  
            // console.log(res.headers, `${executionTime} ms`);
            return getHttpResult(res);
        }
        catch (e: any) {
            const err: HTTPError = e;
            const res = err.response;
            if (res) {
                return getHttpResult(res);
            }
            const err2: RequestError = e;
            const message = err.name == "CancelError" ? "request canceled" : err2.message;
            return {
                responseType:   "error",
                message:        message
            };
        }
    }

    cancelRequest() : void {
        this.request.cancel();
    }
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
