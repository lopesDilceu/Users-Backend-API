import { Router } from 'express';
import { GGDotDealsProxyController } from '../controllers/proxy/ggd-proxy'; // Ajuste o caminho se necessário

const ggdProxyRouter = Router();
const controller = new GGDotDealsProxyController();

// Define as rotas do proxy que seu app Flutter vai chamar
ggdProxyRouter.get('/shops', (req, res) => controller.proxyShopsList(req, res));
ggdProxyRouter.get('/plain', (req, res) => controller.proxyGamePlain(req, res));
ggdProxyRouter.get('/prices', (req, res) => controller.proxyPrices(req, res));

export default ggdProxyRouter;