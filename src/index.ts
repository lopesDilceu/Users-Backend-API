import express from "express";
import { config } from "dotenv";
import { GetUsersController } from "./controllers/get-users/get-users";
import { MongoGetUsersRepository } from "./repositories/get-users/mongo-get-users";
import { MongoClient } from "./database/mongo";
import { MongoCreateUserRepository } from "./repositories/create-user/mongo-create-user";
import { CreateUserController } from "./controllers/create-user/create-user";
import { MongoUpdateUserRepository } from "./repositories/update-user/mongo-update-user";
import { UpdateUserController } from "./controllers/update-user/update-user";
import { MongoDeleteUserRepository } from "./repositories/delete-user/mongo-delete-user";
import { DeleteUserController } from "./controllers/delete-user/delete-user";
import { MongoGetUserRepository } from "./repositories/get-user/mongo-get-user";
import { GetUserController } from "./controllers/get-user/get-user";
import { MongoAuthRepository } from "./repositories/auth/mongo-auth";
import { LoginController } from "./controllers/auth/login";

const main = async () => {
  config();

  const app = express();

  app.use(express.json());

  await MongoClient.connect();

  app.post("/login", async (req, res) => {
    const mongoAuthRepository = new MongoAuthRepository();
    const loginController = new LoginController(mongoAuthRepository);

    const { body, statusCode } = await loginController.handle({
      body: req.body,
    });

    res.status(statusCode).send(body);
  });


  app.get("/users", async (req, res) => {
    const mongoGetUsersRepository = new MongoGetUsersRepository();

    const getUsersController = new GetUsersController(mongoGetUsersRepository);

    const { body, statusCode } = await getUsersController.handle();

    res.status(statusCode).send(body);
  });

  app.post("/users", async (req, res) => {
    const mongoGetUsersRepository = new MongoCreateUserRepository();

    const createUserController = new CreateUserController(
      mongoGetUsersRepository
    );

    const { body, statusCode } = await createUserController.handle({
      body: req.body,
    });

    res.status(statusCode).send(body);
  });

    app.get("/user/:id", async (req, res) => {
    const mongoGetUserRepotory = new MongoGetUserRepository();

    const getUserController = new GetUserController(
      mongoGetUserRepotory
    );

    const { body, statusCode } = await getUserController.handle({
      body: req.body,
      params: req.params,
    });

    res.status(statusCode).send(body);
  });

  app.patch("/users/:id", async (req, res) => {
    const mongoUpdateUserRepotory = new MongoUpdateUserRepository();

    const updateUserController = new UpdateUserController(
      mongoUpdateUserRepotory
    );

    const { body, statusCode } = await updateUserController.handle({
      body: req.body,
      params: req.params,
    });

    res.status(statusCode).send(body);
  });

  app.delete("/users/:id", async (req, res) => {
    const mongoDeleteUserRepotory = new MongoDeleteUserRepository();

    const deleteUserController = new DeleteUserController(
      mongoDeleteUserRepotory
    );

    const { body, statusCode } = await deleteUserController.handle({
      params: req.params,
    });

    res.status(statusCode).send(body);
  });

  const port = process.env.PORT || 8000;

  app.listen(port, () => console.log(`Listening on port ${port}!`));
};

main();
