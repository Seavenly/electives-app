interface IResponseError {
  error: string;
}
interface IResponseMessage {
  message: string;
  data?: {
    [prop: string]: any;
  };
}
export type ResponseMessage = IResponseMessage | IResponseError;
