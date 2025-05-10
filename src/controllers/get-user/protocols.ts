/* eslint-disable no-unused-vars */
import { User } from "../../models/user";

export interface IGetUserRepository {
    getUser(id: string): Promise<User | null>
}


