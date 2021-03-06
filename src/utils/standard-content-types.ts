// Copyright (c) Ullrich Praetz. All rights reserved.
// See LICENSE file in the project root for full license information.

let contentTypeFromExtension:  { [ext: string] : string} | null = null;

export function getExtensionFromContentType(contentType: string) {
    if (!contentTypeFromExtension) {
        contentTypeFromExtension = {};
        for (const ext in standardContentTypes) {
            const contentType = standardContentTypes[ext];
            contentTypeFromExtension[contentType] = ext;
        }
    }
    const extension = contentTypeFromExtension[contentType];
    if (extension) {
        return extension;
    }
    const slashPos = contentType.lastIndexOf("/");
    if (slashPos == -1) {
        return contentType;
    }
    return contentType.substring(slashPos + 1);
}

export function getContentTypeFromExtension(ext: string) {
    const contentType = standardContentTypes[ext];
    if (contentType)
        return contentType;
    return "application/" + contentType;
}

/**
 * Note! language specific files types must only be used here - nowhere else.
 * 
 * List from: [Common MIME types - HTTP | MDN]
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
 */
export const standardContentTypes : { [ext: string] : string} = {
    ".aac":     "audio/aac",
    ".abw":     "application/x-abiword",
    ".arc":     "application/x-freearc",
    ".avi":     "video/x-msvideo",
    ".azw":     "application/vnd.amazon.ebook",
    ".bin":     "application/octet-stream",
    ".bmp":     "image/bmp",
    ".bz":      "application/x-bzip",
    ".bz2":     "application/x-bzip2",
    ".cda":     "application/x-cdf",
    ".csh":     "application/x-csh",
    ".css":     "text/css",
    ".csv":     "text/csv",
    ".doc":     "application/msword",
    ".docx":    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".eot":     "application/vnd.ms-fontobject",
    ".epub":    "application/epub+zip",
    ".gz":      "application/gzip",
    ".gif":     "image/gif",
    ".htm":     "text/html",
    ".htm ":    "text/html",
    ".ico":     "image/vnd.microsoft.icon",
    ".ics":     "text/calendar",
    ".jar":     "application/java-archive",
    ".jpeg ":   "image/jpeg",
    ".jpg":     "image/jpeg",
    ".js":      "text/javascript",
    ".json":    "application/json",
    ".jsonld":  "application/ld+json",
    ".mid":     "audio/midi",
    ".midi":    "audio/x-midi",
    ".mjs":     "text/javascript",
    ".mp3":     "audio/mpeg",
    ".mp4":     "video/mp4",
    ".mpeg":    "video/mpeg",
    ".odp":     "application/vnd.oasis.opendocument.presentation",
    ".ods":     "application/vnd.oasis.opendocument.spreadsheet",
    ".odt":     "application/vnd.oasis.opendocument.text",
    ".ogx":     "audio/ogg",
    ".opus":    "audio/opus",
    ".otf":     "font/otf",
    ".png":     "image/png",
    ".pdf":     "application/pdf",
    ".php":     "application/x-httpd-php",
    ".ppt":     "application/vnd.ms-powerpoint",
    ".pptx":    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".rar":     "application/vnd.rar",
    ".rtf":     "application/rtf",
    ".sh":      "application/x-sh",
    ".svg":     "image/svg+xml",
    ".swf":     "application/x-shockwave-flash",
    ".tar":     "application/x-tar",
    ".tif":     "image/tiff",
    ".tiff":    "image/tiff",
    ".ts":      "video/mp2t",
    ".ttf":     "font/ttf",
    ".txt":     "text/plain",
    ".vsd":     "application/vnd.visio",
    ".wav":     "audio/wav",
    ".weba":    "audio/webm",
    ".webm":    "video/webm",
    ".webp":    "image/webp",
    ".woff":    "font/woff",
    ".xhtml":   "application/xhtml+xml",
    ".xls":     "application/vnd.ms-excel",
    ".xlsx":    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xml":     "application/xml",
    ".xul":     "application/vnd.mozilla.xul+xml",
    ".zip":     "application/zip",
    ".3gp":     "video/3gpp",
    ".3g2":     "video/3gpp2",
    ".7z":      "application/x-7z-compressed"
};
