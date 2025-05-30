import { MongoClient } from "../../database/mongo";
import { User, Role } from "../../models/user";
import {
  CreateUserParams,
  ICreateUserRepository,
} from "../../controllers/create-user/protocols";
import { MongoUser } from "../mongo-protocols";
import bcrypt from "bcrypt";

export class MongoCreateUserRepository implements ICreateUserRepository {
  async createUser(params: CreateUserParams): Promise<User> {
    const now = new Date();

    const emailExists = await MongoClient.db
      .collection("users")
      .findOne({ email: params.email });

    if (emailExists) {
      throw new Error("Email already in use");
    }

    const passwordStrong = (password: string): boolean => {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
      return passwordRegex.test(password);
    };

    if (!passwordStrong(params.password)) {
      throw new Error("Password must be stronger");
    }

    const password = await bcrypt.hash(params.password, 10);

    // Completa os dados com os campos obrigatórios
    const userData: MongoUser = {
      ...params,
      password: password,
      role: Role.USER,
      rememberToken: null,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    console.log(userData);

    const { insertedId } = await MongoClient.db
      .collection("users")
      .insertOne(userData);

    const user = await MongoClient.db
      .collection<MongoUser>("users")
      .findOne({ _id: insertedId });

    if (!user) {
      throw new Error("User not created!");
    }

    const { _id, ...rest } = user;

    return { id: _id.toHexString(), ...rest };
  }
}
