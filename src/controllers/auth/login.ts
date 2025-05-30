/* eslint-disable no-unused-vars */
import { HttpRequest, HttpResponse, IController } from "../protocols";
import { LoginParams, IAuthRepository } from "./protocols"; // Seus protocolos de login
import { 
  IGetUserRepository, 
  User as UserFromDB, // Renomeando para clareza no contexto deste controller
  UserClientResponse, 
  AuthSuccessResponse 
} from "../get-user/protocols"; // Ajuste o caminho conforme sua estrutura
import { badRequest, ok, serverError, unauthorized } from "../helpers";
import * as jwt from 'jsonwebtoken'; // Importe sua biblioteca JWT (ex: jsonwebtoken)

// Defina uma interface para o payload esperado do seu JWT
interface JwtPayload {
  id: string;
  email: string; // E quaisquer outros campos que você inclua no payload do JWT
  // iat?: number;
  // exp?: number;
}

export class LoginController implements IController {
  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly getUserRepository: IGetUserRepository
  ) {}

  // Função helper para decodificar o token (ou você pode usar jwt.verify se quiser validar também)
  // Em um cenário real, você também teria a 'secret' para verificar o token com jwt.verify
  private decodeToken(token: string): JwtPayload | null {
    try {
      // Se você só quer decodificar sem verificar a assinatura (o backend acabou de criar o token):
      const decoded = jwt.decode(token) as JwtPayload;
      // Se você quiser verificar (mais seguro, precisa da sua JWT_SECRET):
      // const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SUA_SECRET_AQUI') as JwtPayload;
      if (decoded && typeof decoded === 'object' && decoded.id) {
        return decoded;
      }
      return null;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  }

  async handle(httpRequest: HttpRequest<LoginParams>): Promise<HttpResponse<AuthSuccessResponse | string>> {
    try {
      const { email, password } = httpRequest.body || {};

      if (!email || !password) {
        return badRequest("Email and password are required");
      }

      const token = await this.authRepository.login({ email, password });

      if (!token) {
        return unauthorized();
      }

      // Passo 2: Decodificar o token para obter o userId
      const decodedPayload = this.decodeToken(token);

      if (!decodedPayload || !decodedPayload.id) {
        console.error(`CRITICAL: Token generated for ${email} but could not decode or find user ID in token.`);
        return serverError();
      }
      const userId = decodedPayload.id;

      // Passo 3: Buscar os detalhes do usuário usando o userId
      const userFromDb: UserFromDB | null = await this.getUserRepository.getUser(userId);

      if (!userFromDb) {
        console.error(`CRITICAL: User ${email} (ID: ${userId}) authenticated, token valid, but user not found in DB via IGetUserRepository.`);
        return serverError();
      }

      // Passo 4: Preparar o objeto 'user' para a resposta ao cliente
      const userClientResponse: UserClientResponse = {
        id: userFromDb.id,
        firstName: userFromDb.firstName,
        lastName: userFromDb.lastName,
        email: userFromDb.email,
        role: userFromDb.role, // Assumindo que 'userFromDb.role' é string 'user'/'admin'
        createdAt: userFromDb.createdAt,
        updatedAt: userFromDb.updatedAt,
      };
      
      return ok<AuthSuccessResponse>({ token, user: userClientResponse });

    } catch (error) {
      console.error("LoginController Error:", error);
      return serverError();
    }
  }
}