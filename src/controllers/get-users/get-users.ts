/* eslint-disable no-unused-vars */
import { User } from "../../models/user";
import { ok, serverError } from "../helpers";
import { HttpResponse, IController } from "../protocols";
import { IGetUsersRepository } from "./protocols";


export class GetUsersController implements IController {
  // getUsersRepository: IGetUsersRepository;

  // constructor(getUsersRepository: IGetUsersRepository) {
  //     this.getUsersRepository = getUsersRepository;
  // }

  constructor(private readonly getUsersRepository: IGetUsersRepository) {}

  async handle(): Promise<HttpResponse<User[] | string>> {
    try {
      // Validar a requisição
      // direcionar chamada para o repository
      const users = await this.getUsersRepository.getUsers();

      return ok<User[]>(users); 

    } catch (error) {
      // tratar a exceção
      return serverError();
    }
  }
}
