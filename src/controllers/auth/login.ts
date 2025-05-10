/* eslint-disable no-unused-vars */
import { HttpRequest, HttpResponse, IController } from "../protocols";
import { LoginParams, IAuthRepository } from "./protocols";
import { badRequest, ok, serverError, unauthorized } from "../helpers";

export class LoginController implements IController {
  constructor(private readonly authRepository: IAuthRepository) {}

  async handle(httpRequest: HttpRequest<LoginParams>): Promise<HttpResponse<string>> {
    try {
      const { email, password } = httpRequest.body || {};

      if (!email || !password) {
        return badRequest("Email and password are required");
      }

      const isValid = await this.authRepository.login({ email, password });

      if (!isValid) {
        return unauthorized();
      }

      return ok("Login successful"); // ou retornar JWT
    } catch {
      return serverError();
    }
  }
}
