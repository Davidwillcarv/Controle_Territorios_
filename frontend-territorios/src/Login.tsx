import { useState } from 'react';
import type { SyntheticEvent } from 'react';

interface LoginProps {
  onLoginSucesso: () => void;
}

export function Login({ onLoginSucesso }: LoginProps) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  // DEFINA AQUI O USUÁRIO E SENHA PADRÃO QUE DÃO ACESSO AO SISTEMA
  const USUARIO_CORRETO = 'admin';
  const SENHA_CORRETA = '123456';

  const handleEntrar = (e: SyntheticEvent) => {
    e.preventDefault();
    setErro('');

    if (usuario === USUARIO_CORRETO && senha === SENHA_CORRETA) {
      // Salva no navegador que o acesso foi liberado
      localStorage.setItem('saas_acesso_liberado', 'true');
      onLoginSucesso();
    } else {
      setErro('Usuário ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleEntrar}
        className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold text-indigo-400 text-center">
          Controle de Territórios
        </h1>
        <p className="text-xs text-slate-400 text-center">
          Digite suas credenciais para acessar
        </p>

        {erro && (
          <p className="text-rose-400 text-sm text-center font-medium bg-rose-950/40 p-2 rounded border border-rose-800">
            {erro}
          </p>
        )}

        <div>
          <label className="block text-xs text-slate-400 mb-1">Usuário</label>
          <input
            type="text"
            required
            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs text-slate-400 mb-1">Senha</label>
          <input
            type="password"
            required
            className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-medium transition text-white"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}