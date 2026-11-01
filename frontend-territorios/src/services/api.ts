import axios from "axios";

export const api = axios.create({
  baseURL: "https://controle-territorios.onrender.com",
});

export interface Usuario {
  id?: number;
  nome: string;
  email: string;
}

export interface Territorio {
  id?: number;
  nomeOuNumero: string;
  ocupado?: boolean;
}

export interface RegistroRetirada {
  id: number;
  usuario: Usuario;
  territorio: Territorio;
  dataRetirada: string;
  previsaoRenovacao: string;
  entregaObrigatoria: string;
  dataDevolucao?: string;
  alertaStatus?: string;
}
