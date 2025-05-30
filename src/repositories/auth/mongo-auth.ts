import { IAuthRepository, LoginParams } from "../../controllers/auth/protocols";
import { MongoClient } from "../../database/mongo";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

  declare var process : {
    env: {
      JWT_SECRET: string,
      JWT_EXPIRES_IN: number,
    }
  }

export class MongoAuthRepository implements IAuthRepository {
  async login(params: LoginParams): Promise<string | null> {
    const user = await MongoClient.db
      .collection("users")
      .findOne({ email: params.email });

      if (!user) return null;


      const passwordMatch = await bcrypt.compare(params.password, user.password);
      if (!passwordMatch) return null;



      const token = jwt.sign(
      { id: user._id.toHexString(), email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
    );

    return token;
  }
}
