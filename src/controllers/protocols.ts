/* eslint-disable no-unused-vars */
export interface HttpResponse<T> {
    statusCode: HttpStatusCode;
    body: T;
}

 export interface HttpRequest<B>{
    params?: any;
    header?: any;
    body?: B;
 }

 export enum HttpStatusCode {
   OK = 200,
   CREATED = 201,
   BAD_REQUEST = 400,
   UNAUTHORIZED = 401,
   SERVER_ERROR = 500,
 }

 export interface IController {
    handle(httpRequest: HttpRequest<unknown>): Promise<HttpResponse<unknown>>;
 }