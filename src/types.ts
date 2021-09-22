

export class ResponseData {
    readonly    status:     number;
    readonly    statusText: string;
    readonly    content:    string;
    readonly    headers:    any;
}

export const globalResponseMap: { [key: string]: ResponseData } = {};

export class RequestHeaders {
    readonly    "Content-Type": string;
}

export class PostClientConfig {
    readonly    endpoint:       string;
    readonly    headers:        RequestHeaders;
    readonly    responseFolder?: string;
}

export const configFileName  =".post-client";