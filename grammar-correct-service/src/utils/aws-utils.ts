/**
 * This file contains the utility functions for AWS services
 */

import {
  DynamoDB,
  GetItemCommandInput,
  PutItemCommandInput,
  PutItemCommandOutput,
  UpdateItemCommandInput,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import {
    GetObjectCommandInput,
    GetObjectCommandOutput,
    PutObjectCommandInput,
    PutObjectCommandOutput,
    S3
} from "@aws-sdk/client-s3";

const region = "eu-central-1";
export const documentClient = new DynamoDB({ region });

// initialize s3 client
const s3 = new S3({ region });

/**
 * This function is used to save the request to the DynamoDB table
 * @param tableName
 * @param request The request to be saved
 */
export const saveItemToDynamo = async (tableName: string, request: Record<string, any>): Promise<PutItemCommandOutput> => {
    const params: PutItemCommandInput = {
        TableName: tableName,
        Item: request
    };
    return await documentClient.putItem(params);
}

/**
 * This function is used to update an item in the DynamoDB table
 * @param tableName The name of the DynamoDB table
 * @param key The key of the item to be updated
 * @param request The request object containing the fields to be updated
 */
export const updateItemToDynamo = async (
    tableName: string,
    key: Record<'partitionKey' | 'sortKey', string>,
    request: Record<string, any>
): Promise<UpdateItemCommandOutput> => {
    const updateExpressionParts: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};

    for (const [field, value] of Object.entries(request)) {
        updateExpressionParts.push(`#${field} = :${field}`);
        expressionAttributeValues[`:${field}`] = value;
    }

    const updateExpression = `set ${updateExpressionParts.join(', ')}`;

    const params: UpdateItemCommandInput = {
        TableName: tableName,
        Key: {
            PartitionKey: { S: key.partitionKey },
            SortKey: { S: key.sortKey },
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: Object.keys(request).reduce((acc, field) => {
            acc[`#${field}`] = field;
            return acc;
        }, {} as Record<string, string>),
    };

    return await documentClient.updateItem(params);
}

/**
 * This function is used to get an item from the DynamoDB table
 * @param tableName
 * @param key
 */
export const getItemFromDynamo = async <T>(tableName: string, key: Record<'partitionKey' | 'sortKey', string>): Promise<T> => {
    const params: GetItemCommandInput = {
        TableName: tableName,
        Key: {
            PartitionKey: { S: key.partitionKey },
            SortKey: { S: key.sortKey },
        },
    };
    const response = await documentClient.getItem(params);
    return response.Item as T;
}

/**
 * This function is used to get an item from the S3 bucket
 * @param bucket
 * @param key
 */
export const getItemFromS3 = async (bucket: string, key: string): Promise<GetObjectCommandOutput> => {
    const params: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key,
    };
    return await s3.getObject(params);
}

/**
 * This function is used to save an item to the S3 bucket
 * @param bucket
 * @param key
 * @param body
 */
export const saveItemToS3 = async (bucket: string, key: string, body: string): Promise<PutObjectCommandOutput> => {
    const params: PutObjectCommandInput = {
        Bucket: bucket,
        Key: key,
        Body: body,
    };
    return await s3.putObject(params);
}