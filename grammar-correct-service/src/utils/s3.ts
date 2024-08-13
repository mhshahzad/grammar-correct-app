import {config} from "../config";
import {getItemFromS3, saveItemToS3} from "./aws-utils";

/**
 * This function is used to get corrected audio from S3
 */
export const getCorrectedAudio = async (filename: string): Promise<string> => {
    const response = await getItemFromS3(config.bucket, filename);
    return response.Body?.transformToString()!;
}

/**
 * This function is used to save corrected audio to S3
 */
export const saveCorrectedAudio = async (filename: string, audio: string): Promise<void> => {
    // Save the audio to S3
    await saveItemToS3(config.bucket, filename, audio);
}