export type RequestItem = {
    partitionKey: string;       // The email of the user
    sortKey: string;            // The requestId of the request
    email: string;              // The email of the user
    requestId: string;          // The requestId of the request
    status: string;             // The status of the request
    filename: string;           // The filename of the audio file
    ttl: number;                // The time to live of the request
    timestamp: number;          // The timestamp of the request: epoch time
};

export type RunItem = {
    requestsProcessed: number;  // The number of requests processed
    requestsFound: number;      // The number of requests found
    requestsFailed: number;     // The number of requests failed
    duration: number;           // The duration of the request processing
    ttl: number;                // The time to live of the request
    timestamp: number;          // The timestamp of the request: epoch time
}
