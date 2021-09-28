import { HttpResponse, RequestData } from "./RequestData";




export abstract class RequestBase {
    readonly requestData:   RequestData;

    constructor(requestData: RequestData) {
        this.requestData = requestData;
    }

    abstract executeHttpRequest() : Promise<HttpResponse>;
    abstract cancelRequest() : void;
}