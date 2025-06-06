import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

export class GGDotDealsProxyController {
  private readonly ggdApiBaseUrl = 'https://api.gg.deals';
  private readonly apiKey = process.env.GGDEALS_API_KEY;

  // Método para fazer o proxy da lista de lojas
  public async proxyShopsList(req: Request, res: Response): Promise<void> {
    const endpoint = '/v1/shops/list';
    console.log(`[GGD Proxy] Chamando: ${this.ggdApiBaseUrl}${endpoint}`);

    if (!this.apiKey) {
        res.status(500).json({ error: "GG.deals API Key não está configurada no servidor." });
        return;
    }

    try {
      const apiResponse = await axios.get(`${this.ggdApiBaseUrl}${endpoint}`, {
        headers: { Authorization: `Token ${this.apiKey}` },
      });
      res.status(apiResponse.status).json(apiResponse.data);
    } catch (error) {
      this._handleAxiosError(error as AxiosError, res);
    }
  }

  // Método para fazer o proxy da busca de "plain" (ID do jogo na GG.deals)
  public async proxyGamePlain(req: Request, res: Response): Promise<void> {
    const endpoint = '/v1/games/plain';
    const queryParams = req.query; 
    console.log(`[GGD Proxy] Chamando: ${this.ggdApiBaseUrl}${endpoint} com params:`, queryParams);
    
    if (!this.apiKey) {
        res.status(500).json({ error: "GG.deals API Key não está configurada no servidor." });
        return;
    }
    if (Object.keys(queryParams).length === 0) {
        res.status(400).json({ error: "Parâmetros de busca (ex: title ou steam_id) são necessários."});
        return;
    }

    try {
      const apiResponse = await axios.get(`${this.ggdApiBaseUrl}${endpoint}`, {
        params: queryParams,
        headers: { Authorization: `Token ${this.apiKey}` },
      });
      res.status(apiResponse.status).json(apiResponse.data);
    } catch (error) {
      this._handleAxiosError(error as AxiosError, res);
    }
  }

  // Método para fazer o proxy da busca de preços regionais
  public async proxyPrices(req: Request, res: Response): Promise<void> {
    const endpoint = '/v2/prices';
    const queryParams = req.query;
    console.log(`[GGD Proxy] Chamando: ${this.ggdApiBaseUrl}${endpoint} com params:`, queryParams);

    if (!this.apiKey) {
        res.status(500).json({ error: "GG.deals API Key não está configurada no servidor." });
        return;
    }
    if (!queryParams.plains || !queryParams.country) {
        res.status(400).json({ error: "Parâmetros 'plains' e 'country' são obrigatórios."});
        return;
    }
    
    try {
      const apiResponse = await axios.get(`${this.ggdApiBaseUrl}${endpoint}`, {
        params: queryParams,
        headers: { Authorization: `Token ${this.apiKey}` },
      });
      res.status(apiResponse.status).json(apiResponse.data);
    } catch (error) {
      this._handleAxiosError(error as AxiosError, res);
    }
  }

  // Helper privado para tratar erros do Axios
  private _handleAxiosError(error: AxiosError, res: Response) {
    console.error(`[GGD Proxy] Erro na chamada Axios: ${error.message}`);
    if (error.response) {
      console.error(`[GGD Proxy] Status: ${error.response.status}, Data:`, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      console.error('[GGD Proxy] Nenhuma resposta recebida do servidor GG.deals.');
      res.status(504).json({ error: 'Gateway Timeout' });
    } else {
      console.error('[GGD Proxy] Erro ao configurar a requisição.');
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}