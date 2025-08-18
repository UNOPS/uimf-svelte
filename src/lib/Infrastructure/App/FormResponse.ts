
export interface FormResponse extends Response {
    FileData?: {
        Filename: string;
        ContentType: string;
        Data: string;
    };
    Metadata: any;
}
