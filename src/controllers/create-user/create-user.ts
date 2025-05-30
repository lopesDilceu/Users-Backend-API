/* eslint-disable no-unused-vars */
import validator from "validator";
import { HttpRequest, HttpResponse, IController } from "../protocols";
import { 
  CreateUserParams, 
  ICreateUserRepository,
  User,            // Importe o UserFromDB (seu User de ../../models/user)
  UserClientResponse,    // Importe UserClientResponse
  AuthSuccessResponse    // Importe AuthSuccessResponse
} from "./protocols"; // Ajuste o caminho para seus protocolos
import { badRequest, created, serverError } from "../helpers"; // Adicione 'conflict' se não existir
import * as jwt from 'jsonwebtoken'; // Importe a biblioteca jsonwebtoken
import { IGetUserRepository } from "../get-user/protocols";

// Seus helpers HTTP (certifique-se de ter 'created' e 'conflict')
// const created = <T = any>(body: T): HttpResponse<T> => ({ statusCode: 201, body });
// const conflict = (message: string): HttpResponse<string> => ({ statusCode: 409, body: message });


export class CreateUserController implements IController {
  constructor(
    private readonly createUserRepository: ICreateUserRepository,
    // Opcional: se você tiver um IGetUserRepository para checar email existente
    private readonly getUserRepository?: IGetUserRepository 
  ) {}

  // Função para gerar o token JWT (exemplo)
  private async generateToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role 
    };
    // Use a mesma SECRET e configurações do seu endpoint de Login
    const secret = process.env.JWT_SECRET || "SUA_CHAVE_SECRETA_AQUI"; // IMPORTANTE: Use uma variável de ambiente!
    const expiresIn = "24h"; // Ou o tempo de expiração desejado

    return jwt.sign(payload, secret, { expiresIn });
  }

  async handle(
    httpRequest: HttpRequest<CreateUserParams>
  ): Promise<HttpResponse<AuthSuccessResponse | string>> { // Tipo de retorno atualizado
    try {
      const requiredFields = ["firstName", "lastName", "email", "password"];
      for (const field of requiredFields) {
        const value = httpRequest?.body?.[field as keyof CreateUserParams];
        // Checa se o campo existe e se não é apenas uma string vazia (após trim)
        if (value === undefined || (typeof value === 'string' && value.trim().length === 0)) {
          return badRequest(`Field ${field} is required`);
        }
      }

      const email = httpRequest.body!.email;
      const emailIsValid = validator.isEmail(email);
      if (!emailIsValid) {
        return badRequest("Email is invalid");
      }

      // Passo Opcional, mas MUITO recomendado: Verificar se o email já existe
      // Isso depende de você ter um IGetUserRepository injetado
      if (this.getUserRepository) {
        const existingUser = await this.getUserRepository.getByEmail(email);
        if (existingUser) {
          return badRequest("Email already in use"); // HTTP 409 Conflict
        }
      }

      // Passo 1: Criar o usuário
      // Seu createUserRepository.createUser deve hashear a senha antes de salvar
      const newUserFromDb: User = await this.createUserRepository.createUser(
        httpRequest.body!
      );

      // Passo 2: Gerar o token JWT para o novo usuário
      const token = await this.generateToken(newUserFromDb);

      if (!token) {
        // Este é um erro interno grave se o usuário foi criado mas o token não
        console.error(`CRITICAL: User ${newUserFromDb.email} created, but failed to generate token.`);
        return serverError();
      }

      // Passo 3: Preparar o objeto 'user' para a resposta ao cliente (sem campos sensíveis)
      const userClientResponse: UserClientResponse = {
        id: newUserFromDb.id,
        firstName: newUserFromDb.firstName,
        lastName: newUserFromDb.lastName,
        email: newUserFromDb.email,
        createdAt: newUserFromDb.createdAt,
        updatedAt: newUserFromDb.updatedAt,
      };

      // Passo 4: Retornar HTTP 201 Created com o token e os detalhes do usuário
      return created<AuthSuccessResponse>({ token, user: userClientResponse });

    } catch (error: any) { // Use 'any' ou um tipo mais específico se souber o que seu repo pode lançar
      // Se o seu createUserRepository lança um erro específico para email duplicado:
      // (Adapte esta lógica de erro para como seu repositório/ORM/DB se comporta)
      if (error.message && error.message.toLowerCase().includes("email already in use")) {
        return badRequest("Email already in use"); // HTTP 409
      }
      if (error.message && error.message.toLowerCase().includes("password must be stronger")) {
        return badRequest(error.message);
      }
      // Erro de duplicação do MongoDB (código 11000)
      if (error.name === 'MongoServerError' && error.code === 11000 && error.keyValue && error.keyValue.email) {
        return badRequest("Email already in use");
      }

      console.error("CreateUserController Error:", error);
      return serverError();
    }
  }
}