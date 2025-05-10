import { MongoClient } from "../../database/mongo";
import { User } from "../../models/user";
import { IGetUsersRepository } from "../../controllers/get-users/protocols";
import { MongoUser } from "../mongo-protocols";

export class MongoGetUsersRepository implements IGetUsersRepository {
  async getUsers(): Promise<User[]> {
    const users = await MongoClient.db
      .collection<MongoUser>("users")
      .find({})
      .toArray();

    return users.map(({ _id, ...rest }) => ({
      ...rest,
      id: _id.toHexString(),
    }));

    // return [{
    //     id: 0,
    //     firstName: 'Dilceu',
    //     lastName: 'Lopes',
    //     role: Role.USER,
    //     email: 'dilceu.lopes@outlook.com',
    //     password: '123123',
    //     rememberToken: null,
    //     createdAt: new Date("2025-03-12T00:00:00Z"),
    //     updatedAt: new Date("2025-03-12T00:00:00Z"),
    //     deletedAt: null
    // }];
  }
}
