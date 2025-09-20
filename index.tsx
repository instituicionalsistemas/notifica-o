import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// TypeScript declaration for the OneSignal window object
declare global {
  interface Window {
    OneSignal: any;
  }
}

const SUPABASE_URL = "https://ymshbfpxeetqqlgzgvkp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltc2hiZnB4ZWV0cXFsZ3pndmtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzNjcxNTYsImV4cCI6MjA3Mzk0MzE1Nn0.ysbTxq0C1yITXSl9qorIxl8XxtxaRaePviHmUy3Q-24";
const TABLE_NAME = "vendedores";

const App = () => {
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // 1. Get OneSignal user ID
      const userId = await window.OneSignal.getUserId();

      if (!userId) {
        throw new Error("Não foi possível obter a permissão para notificações. Por favor, habilite as notificações para este site no seu navegador.");
      }

      // 2. Save to Supabase
      const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Prefer": "return=representation"
        },
        body: JSON.stringify({
          nome: nome,
          telefone: telefone,
          empresa: empresa,
          token_push: userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Supabase error:", errorData);
        throw new Error(errorData.message || "Erro ao cadastrar. Verifique os dados e tente novamente.");
      }

      setMessage({ text: "Cadastro realizado com sucesso e notificações ativadas!", type: 'success' });
      // Clear form
      setNome('');
      setTelefone('');
      setEmpresa('');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado.";
      setMessage({ text: errorMessage, type: 'error' });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Cadastro Vendedor</h2>
      <form id="cadastroForm" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <input
            type="text"
            id="nome"
            placeholder="Nome completo"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            aria-label="Nome completo"
          />
        </div>
        <div className="form-group">
          <input
            type="tel"
            id="telefone"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            required
            aria-label="Telefone"
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            id="empresa"
            placeholder="Empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            required
            aria-label="Empresa"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Cadastrando...' : 'Cadastrar e Ativar Notificação'}
        </button>
      </form>
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}