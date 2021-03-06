// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

import * as path from 'path';
import { getContentTypeFromExtension } from "../utils/standard-content-types";
import { Match } from "../utils/utils";

export const configFileName     = ".post-config";
export const respExt            = ".resp";
export const mdExt              = ".md";
export const respMdExt          = ".resp.md";

export class Endpoint {
    readonly    fileMatch:      string[];
    readonly    url:            string;
    readonly    "Content-Type"?:string;
}

export class RequestHeaders {
    readonly    "Connection"?:  string;
    readonly    "Content-Type"?:string;
}

export class ResponseConfig {
    readonly    folder:         string;
}

export class PostConfig {
    readonly    endpoints:              Endpoint[];
    readonly    headers:                RequestHeaders;
    readonly    response:               ResponseConfig;
    readonly    variables:              { [variable: string]: any };
    readonly    additionalProperties:   any | null;

}


export const defaultConfigString = `{
  "endpoints": [
    { "fileMatch": ["*.json"], "url": "http://localhost:8080/" }
  ],
  "headers": {
    "Connection":   "Keep-Alive"
  },
  "response": {
    "folder":       "response"
  },
  "variables": {
    "{{var-1}}":    "some value"
  },
  "additionalProperties": { }
}`;

export const defaultConfig : PostConfig = JSON.parse(defaultConfigString);

export function getEndpoint(config: PostConfig, filePath: string) : Endpoint | null {
    
    for (const endpoint of config.endpoints) {
        for (const fileMatch of endpoint.fileMatch) {
            if (Match(filePath, fileMatch)) {
                return endpoint;
            }
        }
    }
    return null;
}

export function getConfigPath(fileName: string) : string {
    const srcFolder     = path.dirname (fileName) + "/";
    const configPath    = srcFolder + "/" + configFileName;
    return configPath;
}

export function isConfigFile(fileName: string) : boolean {
    const baseName = path.basename (fileName);
    return baseName == configFileName;
}

export function parseConfig(configContent: string): PostConfig {
    let config: PostConfig;
    config = JSON.parse(configContent);
    config = { ...defaultConfig, ... config };
    return config;
}

export function getHeaders (config: PostConfig, endpoint: Endpoint, file: string) : RequestHeaders {
    let contentType = endpoint['Content-Type'];
    if (!contentType) {
        const ext = path.extname(file);
        contentType = getContentTypeFromExtension(ext);
    }
    const customHeaders:    RequestHeaders = {
        "Content-Type": contentType
    };
    const headers: RequestHeaders = { ...config.headers, ...customHeaders  }; // spread the world :)
    return headers;
}