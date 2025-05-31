import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { MongoClient } from "./database/mongo";
import userRoutes from "./routes/user.routes"; // Importa as rotas de usuário
import authRoutes from "./routes/auth.routes"; // Importa as rotas de autenticação
import imageProxyRoutes from "./routes/image-proxy.routes";

const main = async () => {
  config();

  const app = express();

  app.use(cors());

  app.use(express.json());

  await MongoClient.connect();

  app.use(authRoutes);

  app.use("/users", userRoutes);

  app.use("/proxy", imageProxyRoutes);

  const port = process.env.PORT || 8000;

  app.listen(port, () => console.log(`Listening on port ${port}!`));
};

main();
