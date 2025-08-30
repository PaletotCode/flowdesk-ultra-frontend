// src/components/Dashboard/KPISummary.tsx

"use client";

import { useState, useEffect } from 'react';

// Define a interface para os dados que esperamos da API
interface KpiData {
  periodo: string;
  faturamento_bruto: number;
  total_descontos: number;
  total_devolucoes: number;
  faturamento_liquido: number;
  ticket_medio: number;
  lucratividade_media: number;
  total_pedidos_vendas: number;
}

// Função para formatar números como moeda brasileira
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export default function KPISummary() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        setIsLoading(true);
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/metricas/kpis-gerais`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error('Falha ao buscar os dados da API');
        }

        const data: KpiData = await response.json();
        setKpiData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpis();
  }, []); // O array vazio faz com que isso rode apenas uma vez, quando o componente é montado

  if (isLoading) {
    return <div className="text-center text-gray-400">Carregando KPIs...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Erro: {error}</div>;
  }

  if (!kpiData) {
    return <div className="text-center text-gray-400">Nenhum dado encontrado.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto p-4">
      {/* Card Faturamento Líquido */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Faturamento Líquido</h3>
        <p className="text-3xl font-bold text-green-400 mt-2">
          {formatCurrency(kpiData.faturamento_liquido)}
        </p>
      </div>
      {/* Card Ticket Médio */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Ticket Médio</h3>
        <p className="text-3xl font-bold text-white mt-2">
          {formatCurrency(kpiData.ticket_medio)}
        </p>
      </div>
      {/* Card Total de Vendas */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Total de Vendas</h3>
        <p className="text-3xl font-bold text-white mt-2">
          {kpiData.total_pedidos_vendas.toLocaleString('pt-BR')}
        </p>
      </div>
      {/* Card Lucratividade Média */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">Lucratividade Média</h3>
        <p className="text-3xl font-bold text-yellow-400 mt-2">
          {(kpiData.lucratividade_media * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  );
}