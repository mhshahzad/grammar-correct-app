import {getItemFromDynamo, saveItemToDynamo, updateItemToDynamo,} from "./aws-utils";
import {config} from "../config";
import {RequestEvent} from "../main";
import {RequestItem,} from "../models/grammar-correct-table";

/**
 * This function is used to save the request to the DynamoDB table
 * @param request The request to be saved
 */
export const saveRequest = async (request: RequestEvent): Promise<void> => {
  try {
    await saveItemToDynamo(config.tableName, request);
  } catch (error) {
    console.error(
      `Error saving request: ${request.requestId} to DynamoDB`,
      error,
    );
    throw error;
  }
};

/**
 * This function is used to update the state of the request in the DynamoDB table
 * @param requestId
 * @param state
 */
export const marksTheRequestAsProcessed = async (
  email: string,
  requestId: string,
  status: string,
): Promise<void> => {
  try {
    await updateItemToDynamo(
      config.tableName,
      { partitionKey: email, sortKey: requestId },
      { status },
    );
  } catch (error) {
    console.error(
      `Error updating state for request: ${requestId} to DynamoDB`,
      error,
    );
    throw error;
  }
};

/**
 * This function is used to get the request from the DynamoDB table
 * @param email
 * @param requestId
 */
export const getProcessedItem = async (
  email: string,
  requestId: string,
): Promise<RequestItem | undefined> => {
  try {
    const response = await getItemFromDynamo<RequestItem>(config.tableName, {
      partitionKey: email,
      sortKey: requestId,
    });
    if (response.status === "PROCESSED") {
      return response;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error(`Error getting request: ${requestId} from DynamoDB`, error);
    throw error;
  }
};
