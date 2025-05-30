import { Router } from "express";
import { GetUsersController } from "../controllers/get-users/get-users";
import { MongoGetUsersRepository } from "../repositories/get-users/mongo-get-users";
import { MongoCreateUserRepository } from "../repositories/create-user/mongo-create-user";
import { CreateUserController } from "../controllers/create-user/create-user";
import { MongoUpdateUserRepository } from "../repositories/update-user/mongo-update-user";
import { UpdateUserController } from "../controllers/update-user/update-user";
import { MongoDeleteUserRepository } from "../repositories/delete-user/mongo-delete-user";
import { DeleteUserController } from "../controllers/delete-user/delete-user";
import { MongoGetUserRepository } from "../repositories/get-user/mongo-get-user";
import { GetUserController } from "../controllers/get-user/get-user";
import { isAuthenticated, isAdmin, AuthenticatedRequest } from "../middlewares/auth";

const userRoutes = Router();

// Rota para listar todos os usuários - requer autenticação e admin
userRoutes.get("/", isAuthenticated, isAdmin, async (req, res) => {
  const mongoGetUsersRepository = new MongoGetUsersRepository();
  
  const getUsersController = new GetUsersController(mongoGetUsersRepository);

  const { body, statusCode } = await getUsersController.handle();

  res.status(statusCode).send(body);
});

// Rota para criar um novo usuário
userRoutes.post("/create/", async (req, res) => {
  const mongoCreateUserRepository = new MongoCreateUserRepository(); 

  const createUserController = new CreateUserController(
    mongoCreateUserRepository
  );

  const { body, statusCode } = await createUserController.handle({
    body: req.body,
  });

  res.status(statusCode).send(body);
});

// Rota para buscar um usuário específico pelo ID
userRoutes.get("/:id", isAuthenticated, async (req, res) => {
  const mongoGetUserRepository = new MongoGetUserRepository(); 

  const getUserController = new GetUserController(mongoGetUserRepository);

  const { body, statusCode } = await getUserController.handle({
    body: req.body, 
    params: req.params,
  });

  res.status(statusCode).send(body);
});

// Rota para atualizar um usuário
userRoutes.patch("/update/:id", isAuthenticated, async (req: AuthenticatedRequest, res) => {
  // Verificar se o usuário está tentando alterar a role para admin
  if (req.body.role && req.body.role === "admin" && req.user?.role !== "admin") {
    res.status(403).json({
      error: "Apenas administradores podem alterar a role para admin",
    });
    return;
  }

  const mongoUpdateUserRepository = new MongoUpdateUserRepository(); 

  const updateUserController = new UpdateUserController(
    mongoUpdateUserRepository
  );

  const { body, statusCode } = await updateUserController.handle({
    body: req.body,
    params: req.params,
  });

  res.status(statusCode).send(body);
});

// Rota para deletar um usuário
userRoutes.delete("/delete/:id", isAuthenticated, async (req, res) => {
  const mongoDeleteUserRepository = new MongoDeleteUserRepository(); 

  const deleteUserController = new DeleteUserController(
    mongoDeleteUserRepository
  );

  const { body, statusCode } = await deleteUserController.handle({
    params: req.params,
  });

  res.status(statusCode).send(body);
});

export default userRoutes;
