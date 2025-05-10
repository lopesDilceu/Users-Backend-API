/* eslint-disable no-unused-vars */
import { User } from "../../models/user";

export interface IDeleteUserRepository {
    deleteUser(id: string): Promise<User>;
}