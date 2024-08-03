import {handler, RequestEvent} from '../main';
import {APIGatewayProxyWebsocketEventV2, SQSEvent} from 'aws-lambda';

describe('handler', () => {
    it('returns PROCESSED response for valid RUN_EVENT request', async () => {
        const event: RequestEvent = {type: 'RUN_EVENT', state: "NEW"};
        const response = await handler(event);
        expect(response).toEqual({
            requestId: '12345',
            status: 'PROCESSED',
            data: 'Sample data'
        });
    });

    it('returns FAILURE response for unknown request type', async () => {
        const event = {};
        await expect(handler(event as RequestEvent)).rejects.toEqual({
            requestId: '12345',
            status: 'FAILURE',
            error: 'Unknown request type'
        });
    });

    it('returns PROCESSED response for valid SQSEvent', async () => {
        const event: SQSEvent = {Records: []};
        const response = await handler(event);
        expect(response).toEqual({
            requestId: '12345',
            status: 'PROCESSED',
            data: 'Sample data'
        });
    });

    it('returns PROCESSED response for valid CONNECT_EVENT', async () => {
        const event: APIGatewayProxyWebsocketEventV2 = {requestContext: {eventType: 'CONNECT'}} as any;
        const response = await handler(event);
        expect(response).toEqual({
            requestId: '12345',
            status: 'PROCESSED',
            data: 'Sample data'
        });
    });
});