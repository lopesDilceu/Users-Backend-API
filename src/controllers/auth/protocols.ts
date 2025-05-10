/* eslint-disable no-unused-vars */
export interface LoginParams {
  email: string;
  password: string;
}

export interface IAuthRepository {
  login(params: LoginParams): Promise<boolean>; // ou retornar token
}
