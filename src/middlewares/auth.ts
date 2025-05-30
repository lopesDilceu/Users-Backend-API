import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { MongoGetUserRepository } from "../repositories/get-user/mongo-get-user";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export const isAuthenticated = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("Token de acesso não fornecido");
      res.status(401).json({
        error: "Token de acesso não fornecido",
      });
      return;
    }

    // Verificar se JWT_SECRET está definido
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.log("Configuração do servidor incompleta");
      res.status(500).json({
        error: "Configuração do servidor incompleta",
      });
      return;
    }

    // Verificar e decodificar o token
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Adicionar informações do usuário à requisição
    req.user = decoded;

    next();
  } catch {
    console.log("Token inválido ou expirado");
    res.status(401).json({
      error: "Token inválido ou expirado",
    });
    return;
  }
};

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Verificar se o usuário está autenticado
    if (!req.user) {
      console.log("Usuário não autenticado");
      res.status(401).json({
        error: "Usuário não autenticado",
      });
      return;
    }

    let userRole = req.user.role;

    // Se a role não estiver no token, buscar no banco de dados
    if (!userRole && req.user.id) {
      console.log("Role não encontrada no token, buscando no banco de dados...");
      try {
        const mongoGetUserRepository = new MongoGetUserRepository();
        const userFromDb = await mongoGetUserRepository.getUser(req.user.id);
        console.log("User from DB:", userFromDb);
        if (userFromDb) {
          userRole = userFromDb.role;
          // Atualizar o req.user com a role do banco
          req.user.role = userRole;
          console.log("Role encontrada no banco:", userRole);
        } else {
          console.log("Usuário não encontrado no banco de dados");
          res.status(401).json({
            error: "Usuário não encontrado",
          });
          return;
        }
      } catch (dbError) {
        console.log("Erro ao buscar usuário no banco:", dbError);
        res.status(500).json({
          error: "Erro ao verificar permissões do usuário",
        });
        return;
      }
    }

    // Verificar se o usuário tem role de admin
    if (userRole !== "admin") {
      console.log("Usuário:", req.user);
      console.log("Acesso negado. Role atual:", userRole);
      res.status(403).json({
        error: "Acesso negado. Apenas administradores podem acessar este recurso",
      });
      return;
    }

    console.log("Acesso liberado para admin");
    next();
  } catch {
    console.log("Erro ao verificar permissões de administrador");
    res.status(500).json({
      error: "Erro interno do servidor",
    });
    return;
  }
};
