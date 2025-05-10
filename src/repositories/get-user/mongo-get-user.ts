import { ObjectId } from "mongodb";
import { IGetUserRepository } from "../../controllers/get-user/protocols";
import { MongoClient } from "../../database/mongo";
import { User } from "../../models/user";
import { MongoUser } from "../mongo-protocols";

export class MongoGetUserRepository implements IGetUserRepository {
  async getUser(id: string): Promise<User | null> {
    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      throw new Error("User not found.");
    }

    const { _id, ...rest } = user;

    return { id: _id.toHexString(), ...rest };
  }
}
