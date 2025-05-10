import { IAuthRepository, LoginParams } from "../../controllers/auth/protocols";
import { MongoClient } from "../../database/mongo";
import bcrypt from "bcrypt";


export class MongoAuthRepository implements IAuthRepository {
  async login(params: LoginParams): Promise<boolean> {
    const user = await MongoClient.db
      .collection("users")
      .findOne({ email: params.email });

      if(!user){
        return false;
      }

      const passwordMatch = await bcrypt.compare(params.password, user.password);
      return passwordMatch;
  }
}
