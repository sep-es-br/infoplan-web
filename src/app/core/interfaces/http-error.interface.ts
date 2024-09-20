export interface IHttpError {
  status: string;
  codigo: number;
  mensagem: string;
  erros: Array<string>;
}
