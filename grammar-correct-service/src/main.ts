import { APIGatewayProxyWebsocketEventV2, Context, SQSEvent } from "aws-lambda";
import {
  getProcessedItem,
  marksTheRequestAsProcessed,
  saveRequest,
} from "./utils/db";
import { getCorrectedAudio, saveCorrectedAudio } from "./utils/s3";

/**
 * The main entry point for the lambda function
 */
export type TypeOfRequestType =
  | "RUN_EVENT"
  | "DIRECT_INVOCATION"
  | "REQUEST_EVENT"
  | "CONNECT_EVENT";
export type TypeOfStateType = "NEW" | "PROCESSED";
export type TypeOfResponseStatusType = "PROCESSED" | "FAILURE";

export interface RequestTypeOutput {
  type: TypeOfRequestType;
  payload: RequestEvent | undefined;
}

export interface RequestEvent {
  requestId: string;
  email?: string;
  data?: string;
  state?: TypeOfStateType;
}

export interface ResponseEvent {
  requestId: string;
  email?: string;
  data?: string;
  status: TypeOfResponseStatusType;
  error?: string;
}

export const recognizeRequestType = (
  event: SQSEvent | RequestEvent | APIGatewayProxyWebsocketEventV2,
): RequestTypeOutput => {
  if ("Records" in event) {
    return {
      type: "REQUEST_EVENT",
      payload: JSON.parse(event.Records[0].body) as RequestEvent,
    };
  }
  if ("type" in event) {
    if (event.type === "RUN_EVENT") {
      return {
        type: "RUN_EVENT",
        payload: event as RequestEvent,
      };
    }
    if (event.type === "DIRECT_INVOCATION") {
      return {
        type: "DIRECT_INVOCATION",
        payload: event as RequestEvent,
      };
    }
  }
  if ("requestContext" in event && "eventType" in event.requestContext) {
    if (event.requestContext.eventType === "CONNECT") {
      return {
        type: "CONNECT_EVENT",
        payload: event.body
          ? (JSON.parse(event.body!) as RequestEvent)
          : undefined,
      };
    }
  }
  throw "Unknown request type";
};

export const handler = async (
  event: SQSEvent | RequestEvent | APIGatewayProxyWebsocketEventV2,
  context?: Context,
): Promise<ResponseEvent | void> => {
  try {
    // recognize type of request
    const { payload, type } = recognizeRequestType(event);
    if (!payload || !type) {
      console.log("Invalid request with no payload and/or type missing", event);
      return Promise.resolve();
    }
    const { email, requestId } = payload;
    if (type === "REQUEST_EVENT") {
      await saveRequest(event as RequestEvent);
      return Promise.resolve();
    } else if (type === "RUN_EVENT") {
      // const audioFile = getItemFromS3()
      const response = await correctAudio(payload.data!);
      await marksTheRequestAsProcessed(email!, requestId, "PROCESSED");
      // await saveCorrectedAudio(response);
    } else if (type === "CONNECT_EVENT") {
      const processItem = await getProcessedItem(
        payload.email!,
        payload.requestId,
      );
      if (!processItem) {
        return {
          requestId: payload.requestId,
          email: payload.email,
          status: "FAILURE",
          error: "Request not found",
        };
      } else {
        const audio = await getCorrectedAudio(processItem.filename);
        return {
          requestId: payload.requestId,
          email: payload.email,
          status: "PROCESSED",
          data: audio!,
        };
      }
    }
  } catch (error) {
    console.log(error);
    return Promise.reject();
  }
};
