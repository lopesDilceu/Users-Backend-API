/* eslint-disable no-unused-vars */
import { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';

// Lista de domínios permitidos para buscar imagens (IMPORTANTE PARA SEGURANÇA - PREVENÇÃO DE SSRF)
const ALLOWED_IMAGE_DOMAINS = [
  'cdn.cloudflare.steamstatic.com', // Este você já tinha
  'sttc.gamersgate.com',
  'images.gog-statics.com',
  'hb.imgix.net',
  'cdn.fanatical.com',
  'images.greenmangaming.com',
  // ADICIONE ESTES PARA COBRIR DIFERENTES CDNS DA STEAM:
  'shared.fastly.steamstatic.com', // O domínio específico do erro
  'steamcdn-a.akamaihd.net',       // Outro CDN comum da Steam
  'community.cloudflare.steamstatic.com',
  'www.wingamestore.com',
  'steamcdn-a.akamaihd.net',
  // Você pode adicionar um mais genérico se a checagem for com .endsWith('.steamstatic.com')
  // 'steamstatic.com', // Se sua lógica de checagem `isAllowedDomain` usar .endsWith('.NOMEDODOMINIOPRINCIPAL')
];  

export class ImageProxyController {
  async handleProxyImage(req: Request, res: Response): Promise<void> {
    const imageUrl = req.query.url as string;

    if (!imageUrl) {
      res.status(400).send({ error: 'Image URL (url) is required as a query parameter.' });
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (e) {
      res.status(400).send({ error: 'Invalid image URL format.' });
      return;
    }

    // Validação de Segurança: Checar se o domínio está na lista de permitidos
    const isAllowedDomain = ALLOWED_IMAGE_DOMAINS.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain) {
      console.warn(`[ImageProxy] Blocked attempt to proxy from disallowed domain: ${parsedUrl.hostname}`);
      res.status(403).send({ error: 'Proxying from this domain is not allowed.' });
      return;
    }
    
    // Validação de Segurança Adicional: Checar se o protocolo é HTTP ou HTTPS
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        console.warn(`[ImageProxy] Blocked attempt to proxy non-HTTP/HTTPS protocol: ${parsedUrl.protocol}`);
        res.status(400).send({ error: 'Invalid protocol for image URL.' });
        return;
    }

    console.log(`[ImageProxy] Attempting to proxy image from: ${imageUrl}`);

    try {
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'stream', // Essencial para lidar com dados binários/imagens
        timeout: 10000, // Timeout de 10 segundos (ajuste conforme necessário)
      });

      // Define o Content-Type da resposta baseado na resposta do servidor da imagem
      const contentType = imageResponse.headers['content-type'];
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      } else {
        // Fallback se o content-type não for fornecido (raro para imagens válidas)
        // Poderia tentar adivinhar pelo sufixo da URL, mas é menos confiável
        console.warn(`[ImageProxy] Content-Type not provided by origin server for ${imageUrl}.`);
        // Definir um tipo padrão ou tentar inferir pode ser uma opção, ou erro.
        // Por agora, deixaremos o navegador tentar inferir se não vier.
      }

      // Opcional: Adicionar cabeçalhos de cache para o cliente (navegador)
      // Cache por 1 dia, por exemplo. Ajuste conforme sua necessidade.
      res.setHeader('Cache-Control', 'public, max-age=86400'); 

      // Envia (pipe) a stream da imagem diretamente para a resposta do cliente
      imageResponse.data.pipe(res);

      imageResponse.data.on('end', () => {
        console.log(`[ImageProxy] Successfully proxied image: ${imageUrl}`);
      });

      imageResponse.data.on('error', (streamError: Error) => {
        console.error(`[ImageProxy] Error streaming image data for ${imageUrl}:`, streamError);
        // Se o stream de resposta já começou a ser enviado, pode ser tarde para mudar o status code.
        // Mas se ainda não, podemos tentar enviar um erro.
        if (!res.headersSent) {
          res.status(500).send({ error: 'Error streaming image data.' });
        }
      });

    } catch (error) {
      const axiosError = error as AxiosError; // Type assertion
      console.error(`[ImageProxy] Error fetching image ${imageUrl}:`, axiosError.message);
      
      if (axiosError.response) {
        // O servidor da imagem respondeu com um status de erro (ex: 404, 403)
        console.error(`[ImageProxy] Origin server error: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        res.status(axiosError.response.status).send({ 
          error: `Failed to fetch image from origin: ${axiosError.response.statusText}` 
        });
      } else if (axiosError.request) {
        // A requisição foi feita mas nenhuma resposta foi recebida (ex: timeout, erro de rede do seu backend)
        console.error('[ImageProxy] No response received from origin server.');
        res.status(504).send({ error: 'No response from image origin server (Gateway Timeout).' });
      } else {
        // Algo deu errado ao configurar a requisição
        console.error('[ImageProxy] Error setting up request to origin server.');
        res.status(500).send({ error: 'Internal error while trying to proxy image.' });
      }
    }
  }
}