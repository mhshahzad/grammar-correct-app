import {APIGatewayProxyWebsocketEventV2, Context, SQSEvent} from "aws-lambda";

/**
 * The main entry point for the lambda function
 */
export type TypeOfRequestType = "RUN_EVENT" | "DIRECT_INVOCATION" | "REQUEST_EVENT" | 'CONNECT_EVENT';
export type TypeOfStateType = 'NEW' | 'PROCESSED';
export type TypeOfResponseStatusType = 'PROCESSED' | 'FAILURE';

export interface RequestEvent {
    type: TypeOfRequestType;
    email?: string;
    data?: string;
    state?: TypeOfStateType;
}

export interface ResponseEvent {
    requestId: string;
    status: TypeOfResponseStatusType;
    data?: string;
    error?: string;
}

export const recognizeRequestType = (event: SQSEvent | RequestEvent | APIGatewayProxyWebsocketEventV2): TypeOfRequestType | undefined => {
    if ('Records' in event) {
        return 'REQUEST_EVENT';
    }
    if ('type' in event) {
        if (event.type === 'RUN_EVENT') {
            return 'RUN_EVENT';
        }
        if (event.type === 'DIRECT_INVOCATION') {
            return 'DIRECT_INVOCATION';
        }
    }
    if ('requestContext' in event && 'eventType' in event.requestContext) {
        if (event.requestContext.eventType === 'CONNECT') {
            return 'CONNECT_EVENT';
        }
    }
    return undefined;
}

export const handler = async (event: SQSEvent | RequestEvent | APIGatewayProxyWebsocketEventV2, context?: Context): Promise<ResponseEvent> => {
    // recognize type of request
    const requestType = recognizeRequestType(event);
    try {
        if (!requestType) {
            throw 'Unknown request type';
        }

        /*******************************************
         * Perform some logic to process the request
         ********************************************/


        // Example response for demonstration purposes
        return Promise.resolve({
            requestId: '12345',
            status: 'PROCESSED',
            data: 'Sample data'
        });
    } catch (error) {
        console.log(error);
        return Promise.reject({
            requestId: '12345',
            status: 'FAILURE',
            error
        });
    }
}