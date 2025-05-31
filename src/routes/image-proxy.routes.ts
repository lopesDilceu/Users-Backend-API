import { Router } from "express";
import { ImageProxyController } from "../controllers/proxy/image-proxy"; // Ajuste o caminho

const imageProxyRouter = Router();
const imageProxyController = new ImageProxyController(); // Instancia o controller

// Define a rota GET. Ex: /api/image-proxy?url=URL_DA_IMAGEM
// Se seu prefixo global de API for /api, a rota completa será /api/image-proxy
// Se não, e você montar este router diretamente em /proxy, será /proxy/image-proxy
imageProxyRouter.get("/image", (req, res) =>
  imageProxyController.handleProxyImage(req, res)
);

export default imageProxyRouter;
