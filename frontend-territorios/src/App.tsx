import { useState, useEffect } from 'react';
import type { SyntheticEvent } from 'react';
import { AxiosError } from 'axios';
import { api } from './services/api';
import type { Usuario, Territorio, RegistroRetirada } from './services/api';
import {
  UserPlus,
  MapPin,
  RefreshCw,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  Settings,
  ClipboardList
} from 'lucide-react';

export default function App() {
  // Aba Ativa: 'operacoes' | 'gerenciamento'
  const [abaAtiva, setAbaAtiva] = useState<'operacoes' | 'gerenciamento'>('operacoes');

  // Dados principais
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [retiradas, setRetiradas] = useState<RegistroRetirada[]>([]);

  // Formulários de Cadastro
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', email: '' });
  const [novoTerritorio, setNovoTerritorio] = useState({ nomeOuNumero: '' });
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [selectedTerritorio, setSelectedTerritorio] = useState('');
  const [dataRetiradaCustom, setDataRetiradaCustom] = useState('');

  // Filtros de busca
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTerritorio, setFiltroTerritorio] = useState('');
  const [filtroData, setFiltroData] = useState('');

  // Modais de Edição
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [territorioEditando, setTerritorioEditando] = useState<Territorio | null>(null);
  const [registroEditando, setRegistroEditando] = useState<RegistroRetirada | null>(null);

  // Campos temporários para modais
  const [editNomeUsuario, setEditNomeUsuario] = useState('');
  const [editEmailUsuario, setEditEmailUsuario] = useState('');
  const [editNomeTerritorio, setEditNomeTerritorio] = useState('');
  const [editUsuarioId, setEditUsuarioId] = useState('');
  const [editTerritorioId, setEditTerritorioId] = useState('');

  const carregarDados = async () => {
    try {
      const [resUsers, resTerritorios] = await Promise.all([
        api.get('/usuarios'),
        api.get('/territorios'),
      ]);
      setUsuarios(resUsers.data);
      setTerritorios(resTerritorios.data);
      await handleFiltrar();
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  useEffect(() => {
    let ativo = true;

    const inicializar = async () => {
      try {
        const [resUsers, resTerritorios, resRetiradas] = await Promise.all([
          api.get('/usuarios'),
          api.get('/territorios'),
          api.get('/retiradas/busca'),
        ]);

        if (ativo) {
          setUsuarios(resUsers.data);
          setTerritorios(resTerritorios.data);
          setRetiradas(resRetiradas.data);
        }
      } catch (err) {
        console.error('Erro ao inicializar:', err);
      }
    };

    inicializar();

    return () => {
      ativo = false;
    };
  }, []);

  // --- FILTROS ---
  const handleFiltrar = async (e?: SyntheticEvent) => {
    if (e) e.preventDefault();
    try {
      const response = await api.get('/retiradas/busca', {
        params: {
          nome: filtroNome || undefined,
          territorioId: filtroTerritorio || undefined,
          dataRetirada: filtroData || undefined,
        },
      });
      setRetiradas(response.data);
    } catch (err) {
      console.error('Erro ao buscar retiradas:', err);
    }
  };

  const handleLimparFiltros = async () => {
    setFiltroNome('');
    setFiltroTerritorio('');
    setFiltroData('');
    try {
      const response = await api.get('/retiradas/busca');
      setRetiradas(response.data);
    } catch (err) {
      console.error('Erro ao limpar filtros:', err);
    }
  };

  // --- CADASTROS ---
 const handleCadastrarUsuario = async (e: SyntheticEvent) => {
  e.preventDefault();
  // Agora valida apenas o nome obrigatoriamente
  if (!novoUsuario.nome) return; 
  
  await api.post('/usuarios', novoUsuario);
  setNovoUsuario({ nome: '', email: '' });
  await carregarDados();
};

  const handleCadastrarTerritorio = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!novoTerritorio.nomeOuNumero) return;
    await api.post('/territorios', novoTerritorio);
    setNovoTerritorio({ nomeOuNumero: '' });
    await carregarDados();
  };

  const handleRegistrarRetirada = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!selectedUsuario || !selectedTerritorio) return;

    const params = new URLSearchParams({
      usuarioId: selectedUsuario,
      territorioId: selectedTerritorio,
    });

    if (dataRetiradaCustom) {
      params.append('dataRetirada', dataRetiradaCustom);
    }

    await api.post(`/retiradas?${params.toString()}`);
    setSelectedUsuario('');
    setSelectedTerritorio('');
    setDataRetiradaCustom('');
    await carregarDados();
  };

  // --- EXCLUSÕES ---
  const handleDeletarUsuario = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este publicador? Todo o histórico associado também será removido.')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      await carregarDados();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || 'Erro ao deletar publicador.');
    }
  };

  const handleDeletarTerritorio = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este território? Todo o histórico associado também será removido.')) return;
    try {
      await api.delete(`/territorios/${id}`);
      await carregarDados();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || 'Erro ao deletar território.');
    }
  };

  // --- EDIÇÕES (MODAIS) ---
  const handleAbrirEditUsuario = (u: Usuario) => {
    setUsuarioEditando(u);
    setEditNomeUsuario(u.nome);
    setEditEmailUsuario(u.email);
  };

  const handleSalvarEditUsuario = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!usuarioEditando?.id) return;

    try {
      await api.put(`/usuarios/${usuarioEditando.id}`, {
        nome: editNomeUsuario,
        email: editEmailUsuario,
      });
      setUsuarioEditando(null);
      await carregarDados();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || 'Erro ao atualizar publicador.');
    }
  };

  const handleAbrirEditTerritorio = (t: Territorio) => {
    setTerritorioEditando(t);
    setEditNomeTerritorio(t.nomeOuNumero);
  };

  const handleSalvarEditTerritorio = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!territorioEditando?.id) return;

    try {
      await api.put(`/territorios/${territorioEditando.id}`, {
        nomeOuNumero: editNomeTerritorio,
      });
      setTerritorioEditando(null);
      await carregarDados();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || 'Erro ao atualizar território.');
    }
  };

  const handleAbrirEditRegistro = (registro: RegistroRetirada) => {
    setRegistroEditando(registro);
    setEditUsuarioId(String(registro.usuario.id));
    setEditTerritorioId(String(registro.territorio.id));
  };

  const handleSalvarEditRegistro = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!registroEditando || !editUsuarioId || !editTerritorioId) return;

    try {
      await api.put(`/retiradas/${registroEditando.id}?usuarioId=${editUsuarioId}&territorioId=${editTerritorioId}`);
      setRegistroEditando(null);
      await carregarDados();
    } catch (err) {
      const error = err as AxiosError<{ message?: string }>;
      alert(error.response?.data?.message || 'Erro ao atualizar registro.');
    }
  };

  // --- AÇÕES DE SAÍDAS ---
  const handleRenovar = async (id: number) => {
    await api.put(`/retiradas/${id}/renovar`);
    await carregarDados();
  };

  const handleDevolver = async (id: number) => {
    await api.put(`/retiradas/${id}/devolver`);
    await carregarDados();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Cabeçalho e Navegação */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-700 pb-6">
          <h1 className="text-3xl font-bold text-indigo-400">Controle de Territórios</h1>
          <div className="flex gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setAbaAtiva('operacoes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition ${
                abaAtiva === 'operacoes'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ClipboardList className="w-4 h-4" /> Operações
            </button>
            <button
              onClick={() => setAbaAtiva('gerenciamento')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition ${
                abaAtiva === 'gerenciamento'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" /> Gerenciamento
            </button>
          </div>
        </div>

        {/* ABA 1: OPERAÇÕES (Dia a Dia) */}
        {abaAtiva === 'operacoes' && (
          <div className="space-y-8">
            {/* Registrar Retirada */}
            <form onSubmit={handleRegistrarRetirada} className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-300">
                <Clock className="w-5 h-5" /> Registrar Saída
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="selectedUsuario" className="block text-xs text-slate-400 mb-1">Publicador</label>
                  <select
                    id="selectedUsuario"
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none"
                    value={selectedUsuario}
                    onChange={(e) => setSelectedUsuario(e.target.value)}
                  >
                    <option value="">Selecione o Publicador</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="selectedTerritorio" className="block text-xs text-slate-400 mb-1">Território</label>
                  <select
                    id="selectedTerritorio"
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none"
                    value={selectedTerritorio}
                    onChange={(e) => setSelectedTerritorio(e.target.value)}
                  >
                    <option value="">Selecione o Território</option>
                    {territorios.map((t) => (
                      <option key={t.id} value={t.id}>{t.nomeOuNumero}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="dataRetiradaCustom" className="block text-xs text-slate-400 mb-1">
                  Data de Saída (opcional - usa hoje se em branco)
                </label>
                <input
                  id="dataRetiradaCustom"
                  type="date"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
                  value={dataRetiradaCustom}
                  onChange={(e) => setDataRetiradaCustom(e.target.value)}
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-medium transition">
                Registrar Saída
              </button>
            </form>

            {/* Filtros */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-4">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-300">
                <Filter className="w-5 h-5" /> Filtrar Registros
              </h2>
              <form onSubmit={handleFiltrar} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="filtroNome" className="block text-xs text-slate-400 mb-1">Nome do Publicador</label>
                  <input
                    id="filtroNome"
                    type="text"
                    placeholder="Buscar por nome..."
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                    value={filtroNome}
                    onChange={(e) => setFiltroNome(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="filtroTerritorio" className="block text-xs text-slate-400 mb-1">Território</label>
                  <select
                    id="filtroTerritorio"
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                    value={filtroTerritorio}
                    onChange={(e) => setFiltroTerritorio(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {territorios.map((t) => (
                      <option key={t.id} value={t.id}>{t.nomeOuNumero}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="filtroData" className="block text-xs text-slate-400 mb-1">Data Retirada</label>
                  <input
                    id="filtroData"
                    type="date"
                    className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                    value={filtroData}
                    onChange={(e) => setFiltroData(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-medium transition flex items-center justify-center gap-1"
                  >
                    <Search className="w-4 h-4" /> Buscar
                  </button>
                  <button
                    type="button"
                    onClick={handleLimparFiltros}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-2 rounded font-medium transition"
                  >
                    Limpar
                  </button>
                </div>
              </form>
            </div>

            {/* Tabela de Saídas */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
              <h2 className="text-xl font-semibold p-6 border-b border-slate-700">
                Histórico de Saídas
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-700/50 text-slate-400 text-sm">
                      <th className="p-4">Publicador</th>
                      <th className="p-4">Território</th>
                      <th className="p-4">Data Retirada</th>
                      <th className="p-4">Previsão Renovação</th>
                      <th className="p-4">Entrega Obrigatória</th>
                      <th className="p-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {retiradas.length > 0 ? (
                      retiradas.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-700/30">
                          <td className="p-4">{r.usuario?.nome}</td>
                          <td className="p-4 font-medium">{r.territorio?.nomeOuNumero}</td>
                          <td className="p-4 text-slate-400">{r.dataRetirada}</td>
                          <td className="p-4 text-amber-400">{r.previsaoRenovacao}</td>
                          <td className="p-4 text-rose-400">{r.entregaObrigatoria}</td>
                          <td className="p-4 flex gap-2">
                            {!r.dataDevolucao ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAbrirEditRegistro(r)}
                                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded text-sm transition"
                                  title="Corrigir Registro"
                                >
                                  <Edit2 className="w-3.5 h-3.5" /> Editar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRenovar(r.id)}
                                  className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 px-2.5 py-1 rounded text-sm transition"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" /> Renovar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDevolver(r.id)}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded text-sm transition"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" /> Devolver
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-500 text-sm font-semibold">Devolvido</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-slate-500">
                          Nenhum registro encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: GERENCIAMENTO (Publicadores & Territórios) */}
        {abaAtiva === 'gerenciamento' && (
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Gestão de Publicadores */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-300">
                <UserPlus className="w-5 h-5" /> Cadastrar Novo Publicador
              </h2>
              <form onSubmit={handleCadastrarUsuario} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome do Publicador"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={novoUsuario.nome}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, nome: e.target.value })}
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={novoUsuario.email}
                  onChange={(e) => setNovoUsuario({ ...novoUsuario, email: e.target.value })}
                />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-medium transition">
                  Cadastrar Publicador
                </button>
              </form>

              <div className="pt-4 border-t border-slate-700 space-y-3">
                <h3 className="text-md font-medium text-slate-300">Publicadores Cadastrados</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {usuarios.map((u) => (
                    <div key={u.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded border border-slate-600">
                      <div>
                        <p className="font-medium text-slate-200">{u.nome}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAbrirEditUsuario(u)}
                          className="p-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded transition"
                          title="Editar Publicador"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.id !== undefined && (
                          <button
                            onClick={() => handleDeletarUsuario(u.id as number)}
                            className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded transition"
                            title="Deletar Publicador"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gestão de Territórios */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-300">
                <MapPin className="w-5 h-5" /> Cadastrar Novo Território
              </h2>
              <form onSubmit={handleCadastrarTerritorio} className="space-y-3">
                <input
                  type="text"
                  placeholder="Nome ou Número do Território"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={novoTerritorio.nomeOuNumero}
                  onChange={(e) => setNovoTerritorio({ ...novoTerritorio, nomeOuNumero: e.target.value })}
                />
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-medium transition">
                  Cadastrar Território
                </button>
              </form>

              <div className="pt-4 border-t border-slate-700 space-y-3">
                <h3 className="text-md font-medium text-slate-300">Territórios Cadastrados</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {territorios.map((t) => (
                    <div key={t.id} className="flex justify-between items-center bg-slate-700/50 p-3 rounded border border-slate-600">
                      <span className="font-medium text-slate-200">{t.nomeOuNumero}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAbrirEditTerritorio(t)}
                          className="p-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded transition"
                          title="Editar Território"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {t.id !== undefined && (
                          <button
                            onClick={() => handleDeletarTerritorio(t.id as number)}
                            className="p-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded transition"
                            title="Deletar Território"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* MODAL: EDITAR PUBLICADOR */}
      {usuarioEditando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
                <Edit2 className="w-5 h-5" /> Editar Publicador
              </h3>
              <button onClick={() => setUsuarioEditando(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarEditUsuario} className="space-y-4">
              <div>
                <label htmlFor="editNomeUsuario" className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  id="editNomeUsuario"
                  type="text"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={editNomeUsuario}
                  onChange={(e) => setEditNomeUsuario(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="editEmailUsuario" className="block text-sm text-slate-400 mb-1">E-mail</label>
                <input
                  id="editEmailUsuario"
                  type="email"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={editEmailUsuario}
                  onChange={(e) => setEditEmailUsuario(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setUsuarioEditando(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR TERRITÓRIO */}
      {territorioEditando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
                <Edit2 className="w-5 h-5" /> Editar Território
              </h3>
              <button onClick={() => setTerritorioEditando(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarEditTerritorio} className="space-y-4">
              <div>
                <label htmlFor="editNomeTerritorio" className="block text-sm text-slate-400 mb-1">Nome ou Número</label>
                <input
                  id="editNomeTerritorio"
                  type="text"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={editNomeTerritorio}
                  onChange={(e) => setEditNomeTerritorio(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setTerritorioEditando(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR REGISTRO DE SAÍDA */}
      {registroEditando && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <h3 className="text-lg font-semibold text-indigo-300 flex items-center gap-2">
                <Edit2 className="w-5 h-5" /> Corrigir Registro de Saída
              </h3>
              <button onClick={() => setRegistroEditando(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSalvarEditRegistro} className="space-y-4">
              <div>
                <label htmlFor="editUsuarioId" className="block text-sm text-slate-400 mb-1">Publicador</label>
                <select
                  id="editUsuarioId"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={editUsuarioId}
                  onChange={(e) => setEditUsuarioId(e.target.value)}
                >
                  {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>{u.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="editTerritorioId" className="block text-sm text-slate-400 mb-1">Território</label>
                <select
                  id="editTerritorioId"
                  className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none focus:border-indigo-500"
                  value={editTerritorioId}
                  onChange={(e) => setEditTerritorioId(e.target.value)}
                >
                  {territorios.map((t) => (
                    <option key={t.id} value={t.id}>{t.nomeOuNumero}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setRegistroEditando(null)}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-sm font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition"
                >
                  Salvar Alteração
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}