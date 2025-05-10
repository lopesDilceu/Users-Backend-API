/* eslint-disable no-unused-vars */
import { User } from "../../models/user";
import { badRequest, ok, serverError } from "../helpers";
import { HttpRequest, HttpResponse, IController } from "../protocols";
import { IGetUserRepository } from "./protocols";

export class GetUserController implements IController {
  constructor(private readonly getUserRepository: IGetUserRepository) {}
  async handle(
    httpRequest: HttpRequest<unknown>
  ): Promise<HttpResponse<unknown>> {
    try {
      const id = httpRequest?.params?.id;

      if (!id) {
        return badRequest("Missing user id");
      }

      const user = await this.getUserRepository.getUser(id);

      return ok<User>(user);
    } catch (error) {
      return serverError();
    }
  }
}
