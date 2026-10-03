import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
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