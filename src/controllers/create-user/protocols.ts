/* eslint-disable no-unused-vars */
import { User } from "../../models/user";

export interface CreateUserParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface ICreateUserRepository {
  createUser(params: CreateUserParams): Promise<User>;
}

export interface UserClientResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSuccessResponse {
  token: string;
  user: UserClientResponse;
}

export { User };
