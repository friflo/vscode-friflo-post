// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

// import * as http from 'http';
// import * as https from 'https';
import got, { CancelableRequest, HTTPError, RequestError, OptionsOfTextResponseBody, Response } from 'got';
// import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { RequestData, ResponseData } from '../models/RequestData';

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

export class HttpRequest {
    readonly requestData:   RequestData;
    readonly request:       CancelableRequest<Response<string>>;    
}

export function createHttpRequest(requestData: RequestData, requestBody: string) : HttpRequest {
    const options: OptionsOfTextResponseBody = {
        headers:    requestData.headers,
        body:       requestBody,
        timeout:    3_000
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
    return { request: cancelableRequest, requestData: requestData };
}

export async function executeHttpRequest(httpRequest: HttpRequest) : Promise<ResponseData | null> {
    let response: ResponseData | null;
    const requestData   = httpRequest.requestData;
    const startTime     = new Date().getTime();
    try {
        const res           = await httpRequest.request;
        const executionTime = new Date().getTime() - startTime;
        response = {
            requestData:    requestData,
            httpResponse: {
                httpType:  "result",
                status:     res.statusCode,
                statusText: res.statusMessage!,
                content:    res.body,
                headers:    res.headers,
            },
            executionTime:  executionTime,
        };
        // console.log(res.headers, `${executionTime} ms`);
    }
    catch (e: any) {
        const executionTime = new Date().getTime() - startTime;
        const err: HTTPError = e;
        if (err.response) {
            response = {
                requestData:    requestData,
                httpResponse: {
                    httpType:  "result",
                    status:     err.response.statusCode,
                    statusText: err.response.statusMessage!,
                    content:    err.response.body as string,
                    headers:    err.response.headers,
                },
                executionTime:  executionTime,
            };
        } else {            
            const err: RequestError = e;
            const message = err.name == "CancelError" ? "request canceled" : err.message;
            response = {
                requestData:    requestData,
                httpResponse: {
                    httpType:   "error",
                    message:    message
                },
                executionTime:  executionTime,
            };
        }       
    }
    return response;
}
