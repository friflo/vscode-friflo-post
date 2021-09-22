

export class ResponseData {
    readonly    status:     number;
    readonly    statusText: string;
    readonly    content:    string;
    readonly    headers:    any;
}

export const globalResponseMap: { [key: string]: ResponseData } = {};

export class PostClientConfig {
    readonly    endpoint:   string;
}