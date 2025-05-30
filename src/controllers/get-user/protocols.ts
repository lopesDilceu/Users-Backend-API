/* eslint-disable no-unused-vars */
import { User } from "../../models/user";

export interface IGetUserRepository {
  getUser(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
}

export interface UserClientResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSuccessResponse {
  token: string;
  user: UserClientResponse;
}
export { User };
