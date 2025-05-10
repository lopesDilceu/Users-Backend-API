/* eslint-disable no-unused-vars */
import { User } from "../../models/user";
import { badRequest, ok, serverError } from "../helpers";
import { HttpRequest, HttpResponse, IController } from "../protocols";
import { IUpdateUserRepository, UpdateUserParams } from "./protocols";

export class UpdateUserController implements IController {
  constructor(private readonly updateUserRepository: IUpdateUserRepository) {}

  async handle(httpRequest: HttpRequest<UpdateUserParams>): Promise<HttpResponse<User | string>> {
    try {
      const id = httpRequest?.params?.id;
      const body = httpRequest?.body;

      if(!body){
        return badRequest("Body missing fields");
      }

      if (!id) {
        return badRequest("Missing user id");
      }

      const allowedFieldsToUpdate: (keyof UpdateUserParams)[] = [
        "firstName",
        "lastName",
        "password",
      ];

      const someFieldsAreNotAllowedToUpdate = Object.keys(body).some(
        (key) => !allowedFieldsToUpdate.includes(key as keyof UpdateUserParams)
      );

      if (someFieldsAreNotAllowedToUpdate) {
        return badRequest("Some fields are not allowed to be updated");
      }

      const user = await this.updateUserRepository.updateUser(id, body);

      return ok<User>(user);

    } catch (error) {
      return serverError();
    }
  }
}
