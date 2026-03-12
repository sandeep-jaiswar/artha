"use client";

import { useEffect, useState } from "react";

interface EquityData {
  SYMBOL: string;
  SERIES: string;
  OPEN: number;
  HIGH: number;
  LOW: number;
  CLOSE: number;
  LAST: number;
  PREVCLOSE: number;
  TOTTRDQTY: number;
  TOTTRDVAL: number;
  TIMESTAMP: string;
  TOTALTRADES: number;
  ISIN: string;
}

export default function TerminalDashboard() {
  const [data, setData] = useState<EquityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://localhost:8001/api/market-data");
        if (!response.ok) {
          throw new Error("Failed to fetch data from service");
        }
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Artha Terminal
        </h1>
        <p className="text-gray-400 mt-2">Real-time Financial Data Infrastructure</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all">
          <h3 className="text-gray-500 text-sm font-medium">Pipeline Status</h3>
          <p className="text-2xl font-semibold mt-2 text-emerald-400">Connected</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all">
          <h3 className="text-gray-500 text-sm font-medium">Data Service</h3>
          <p className="text-2xl font-semibold mt-2 text-emerald-400">Live</p>
        </div>
        <div className="bg-[#1a1a1a] border border-gray-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all">
          <h3 className="text-gray-500 text-sm font-medium">Records Ingested</h3>
          <p className="text-2xl font-semibold mt-2">{data.length}</p>
        </div>
      </div>

      <div className="bg-[#111111] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Latest Market Activity</h2>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading vault data...</div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">Error: {error}</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#1a1a1a] text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">Symbol</th>
                  <th className="px-6 py-4">Close</th>
                  <th className="px-6 py-4">Change %</th>
                  <th className="px-6 py-4">High</th>
                  <th className="px-6 py-4">Low</th>
                  <th className="px-6 py-4">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.map((item) => {
                  const change = ((item.CLOSE - item.PREVCLOSE) / item.PREVCLOSE) * 100;
                  return (
                    <tr key={item.SYMBOL} className="hover:bg-blue-500/5 transition-colors cursor-pointer group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-blue-400 group-hover:text-blue-300">{item.SYMBOL}</span>
                        <span className="ml-2 text-[10px] text-gray-600 border border-gray-700 rounded px-1">{item.SERIES}</span>
                      </td>
                      <td className="px-6 py-4 font-mono">{item.CLOSE.toFixed(2)}</td>
                      <td className={`px-6 py-4 font-mono ${change >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {change >= 0 ? "+" : ""}{change.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{item.HIGH.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{item.LOW.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono">{item.TOTTRDQTY.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <footer className="mt-12 text-center text-gray-600 text-xs">
        Powered by FinanceIndia & Next.js Ecosystem
      </footer>
    </div>
  );
}
