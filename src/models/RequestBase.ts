import { RequestData, ResponseData } from "./RequestData";


export type CreateRequest = (requestData: RequestData) => RequestBase;

export abstract class RequestBase {
    readonly requestData:   RequestData;

    constructor(requestData: RequestData) {
        this.requestData = requestData;
    }

    abstract executeHttpRequest() : Promise<ResponseData>;
    abstract cancelRequest() : void;
}