import { Router } from "express";
import { MongoAuthRepository } from "../repositories/auth/mongo-auth";
import { LoginController } from "../controllers/auth/login";
import { MongoGetUserRepository } from "../repositories/get-user/mongo-get-user";

const authRoutes = Router();

authRoutes.post("/login", async (req, res) => {
  const mongoAuthRepository = new MongoAuthRepository();
  const mongoGetUserRepository = new MongoGetUserRepository();

  const loginController = new LoginController(mongoAuthRepository, mongoGetUserRepository);
  const { body, statusCode } = await loginController.handle({
    body: req.body,
  });
  res.status(statusCode).send(body);
});

export default authRoutes;