'use client'; // Adicionar no topo para componentes com interatividade

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  Settings, 
  Move, 
  Maximize2, 
  Copy, 
  X, 
  Sun, 
  Moon, 
  Contrast,
  Menu,
  Grip
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  WidgetProps, 
  Themes, 
  GridOverlayProps, 
  TopbarProps, 
  GalaxyBackgroundProps, 
  WidgetType, 
  GridPosition,
  GridSize,
  SalesData,
  ProductData,
  KpiData
} from '@/types'; // Importando nossos tipos

// Configuração do Grid
const GRID_SIZE: number = 40;
const MIN_WIDGET_SIZE: GridSize = { width: 8, height: 6 };
const MAX_WIDGET_SIZE: GridSize = { width: 20, height: 15 };

// Funções para snap ao grid
const snapToGrid = (value: number): number => Math.round(value / GRID_SIZE) * GRID_SIZE;
const gridUnitsToPixels = (units: number): number => units * GRID_SIZE;
const pixelsToGridUnits = (pixels: number): number => Math.round(pixels / GRID_SIZE);

// Mock data
const salesData: SalesData[] = [
  { month: 'Jan', sales: 4000, orders: 240 },
  { month: 'Feb', sales: 3000, orders: 198 },
  { month: 'Mar', sales: 5000, orders: 300 },
  { month: 'Apr', sales: 4500, orders: 278 },
  { month: 'May', sales: 6000, orders: 389 },
  { month: 'Jun', sales: 5500, orders: 349 }
];

const productData: ProductData[] = [
  { name: 'Produto A', value: 400, color: '#8884d8' },
  { name: 'Produto B', value: 300, color: '#82ca9d' },
  { name: 'Produto C', value: 200, color: '#ffc658' },
  { name: 'Produto D', value: 100, color: '#ff7c7c' }
];

const kpiData: KpiData[] = [
  { title: 'Faturamento', value: 'R$ 125.430', change: '+12.5%', icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
  { title: 'Pedidos', value: '1.847', change: '+8.2%', icon: ShoppingCart, color: 'from-blue-500 to-indigo-600' },
  { title: 'Clientes', value: '892', change: '+15.3%', icon: Users, color: 'from-purple-500 to-violet-600' },
  { title: 'Conversão', value: '3.2%', change: '+0.8%', icon: TrendingUp, color: 'from-orange-500 to-red-600' }
];

// Temas
const themes: Themes = {
  light: {
    name: 'Claro',
    bg: 'from-slate-100 to-blue-50',
    cardBg: 'bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl shadow-blue-500/10',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200/50',
    accent: 'text-blue-600',
    button: 'bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 shadow-lg',
    topbar: 'bg-white/80 backdrop-blur-2xl border-gray-200/30 shadow-xl'
  },
  dark: {
    name: 'Escuro', 
    bg: 'from-gray-900 via-slate-900 to-black',
    cardBg: 'bg-gray-900/80 backdrop-blur-xl border-gray-700/30 shadow-2xl shadow-purple-500/20',
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-gray-700/50',
    accent: 'text-cyan-400',
    button: 'bg-gray-800/90 hover:bg-gray-700/90 text-gray-200 hover:text-white shadow-lg',
    topbar: 'bg-gray-900/80 backdrop-blur-2xl border-gray-800/30 shadow-2xl'
  },
  highContrast: {
    name: 'Alto Contraste',
    bg: 'from-black to-gray-900',
    cardBg: 'bg-white/95 border-4 border-black shadow-2xl',
    text: 'text-black',
    textSecondary: 'text-gray-800',
    border: 'border-black',
    accent: 'text-yellow-600',
    button: 'bg-yellow-400 hover:bg-yellow-500 text-black font-bold shadow-xl',
    topbar: 'bg-white/95 border-4 border-b-black shadow-2xl'
  }
};

// Grid Visual Debug Component
const GridOverlay: React.FC<GridOverlayProps> = ({ show, theme }) => {
  if (!show) return null;
  
  const gridLines = [];
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  for (let x = 0; x <= viewportWidth; x += GRID_SIZE) {
    gridLines.push(<line key={`v-${x}`} x1={x} y1={0} x2={x} y2={viewportHeight} stroke={theme.name === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="0.5" opacity="0.3" />);
  }
  
  for (let y = 0; y <= viewportHeight; y += GRID_SIZE) {
    gridLines.push(<line key={`h-${y}`} x1={0} y1={y} x2={viewportWidth} y2={y} stroke={theme.name === 'dark' ? '#374151' : '#e5e7eb'} strokeWidth="0.5" opacity="0.3" />);
  }
  
  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      <svg width="100%" height="100%" className="absolute inset-0">{gridLines}</svg>
    </div>
  );
};

// Componente de Widget
const Widget: React.FC<WidgetProps> = ({ id, title, type, gridPosition, gridSize, onMove, onResize, onDelete, onDuplicate, theme }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, gridX: 0, gridY: 0 });
  const [showActions, setShowActions] = useState(false);
  const [dragPreview, setDragPreview] = useState<GridPosition | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  const pixelPosition = { x: gridUnitsToPixels(gridPosition.x), y: gridUnitsToPixels(gridPosition.y) };
  const pixelSize = { width: gridUnitsToPixels(gridSize.width), height: gridUnitsToPixels(gridSize.height) };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.widget-action') || target.closest('.resize-handle')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, gridX: gridPosition.x, gridY: gridPosition.y });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    const newGridX = Math.max(0, dragStart.gridX + pixelsToGridUnits(deltaX));
    const newGridY = Math.max(0, dragStart.gridY + pixelsToGridUnits(deltaY));
    setDragPreview({ x: newGridX, y: newGridY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (isDragging && dragPreview) {
      onMove(id, dragPreview);
      setDragPreview(null);
    }
    setIsDragging(false);
  }, [isDragging, dragPreview, id, onMove]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startGridWidth = gridSize.width;
    const startGridHeight = gridSize.height;

    const handleResize = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      const newGridWidth = Math.max(MIN_WIDGET_SIZE.width, Math.min(MAX_WIDGET_SIZE.width, startGridWidth + pixelsToGridUnits(deltaX)));
      const newGridHeight = Math.max(MIN_WIDGET_SIZE.height, Math.min(MAX_WIDGET_SIZE.height, startGridHeight + pixelsToGridUnits(deltaY)));
      onResize(id, { width: newGridWidth, height: newGridHeight });
    };

    const handleStop = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleStop);
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleStop);
  };
  
  // O resto do componente Widget continua aqui... (renderContent, return JSX)
  const renderContent = () => {
    // Auto-transform logic baseado no grid size
    const shouldTransform = gridSize.width < 10 || gridSize.height < 8;
    const actuallyTransforming = shouldTransform && ['table', 'line', 'bar'].includes(type);

    if (actuallyTransforming) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className={`text-lg font-bold ${theme.text} mb-2`}>📊 Resumo</div>
            <div className={`text-sm ${theme.textSecondary}`}>
              {type === 'table' ? 'Dados Compactos' : 'Mini Gráfico'}
            </div>
          </div>
        </div>
      );
    }

    switch (type) {
      case 'kpi':
        const kpi = kpiData[parseInt(id) % kpiData.length];
        const Icon = kpi.icon;
        return (
          <div className="h-full flex items-center justify-between p-2">
            <div className="flex-1">
              <div className={`text-2xl font-bold ${theme.text} mb-1`}>{kpi.value}</div>
              <div className={`text-sm ${theme.textSecondary} mb-2`}>{kpi.title}</div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${kpi.color} text-white`}>
                {kpi.change}
              </div>
            </div>
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.name === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={theme.name === 'highContrast' ? '#000' : theme.name === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <YAxis stroke={theme.name === 'highContrast' ? '#000' : theme.name === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.name === 'dark' ? '#1f2937' : '#fff',
                  border: theme.name === 'highContrast' ? '2px solid black' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: theme.name === 'dark' ? '#fff' : '#000',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
              />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fill="url(#lineGradient)" />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.name === 'dark' ? '#374151' : '#e5e7eb'} />
              <XAxis dataKey="month" stroke={theme.name === 'highContrast' ? '#000' : theme.name === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <YAxis stroke={theme.name === 'highContrast' ? '#000' : theme.name === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.name === 'dark' ? '#1f2937' : '#fff',
                  border: theme.name === 'highContrast' ? '2px solid black' : '1px solid #d1d5db',
                  borderRadius: '8px',
                  color: theme.name === 'dark' ? '#fff' : '#000',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
              />
              <Bar dataKey="orders" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                outerRadius="80%"
                dataKey="value"
                label={({ name, percent }: any) => `${name}`}
                labelLine={false}
              >
                {productData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={theme.name === 'dark' ? '#1f2937' : '#fff'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: theme.name === 'dark' ? '#1f2937' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  color: theme.name === 'dark' ? '#fff' : '#000',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'table':
        return (
          <div className="overflow-auto h-full">
            <table className="w-full text-sm">
              <thead className="sticky top-0">
                <tr className={`border-b ${theme.border} bg-gradient-to-r from-blue-50 to-purple-50 ${theme.name === 'dark' ? 'from-gray-800 to-gray-700' : ''}`}>
                  <th className={`text-left p-3 font-semibold ${theme.text}`}>Produto</th>
                  <th className={`text-right p-3 font-semibold ${theme.text}`}>Vendas</th>
                  <th className={`text-right p-3 font-semibold ${theme.text}`}>Status</th>
                </tr>
              </thead>
              <tbody>
                {productData.map((item, i) => (
                  <tr key={i} className={`border-b ${theme.border} hover:bg-blue-50/50 ${theme.name === 'dark' ? 'hover:bg-gray-800/50' : ''} transition-colors`}>
                    <td className={`p-3 ${theme.text} font-medium`}>{item.name}</td>
                    <td className={`p-3 text-right ${theme.text} font-mono`}>{item.value.toString()}</td>
                    <td className="p-3 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        item.value > 300 ? 'bg-green-100 text-green-800' : 
                        item.value > 200 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.value > 300 ? 'Alto' : item.value > 200 ? 'Médio' : 'Baixo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
      default:
        return (
          <div className={`text-center ${theme.textSecondary} flex items-center justify-center h-full`}>
            <div>
              <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <div>Widget {type}</div>
            </div>
          </div>
        );
    }
  };

  const currentPosition = dragPreview ? 
    { x: gridUnitsToPixels(dragPreview.x), y: gridUnitsToPixels(dragPreview.y) } : 
    pixelPosition;

  return (
    <>
      {dragPreview && (
        <div
          className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10 rounded-lg pointer-events-none z-40"
          style={{
            left: gridUnitsToPixels(dragPreview.x),
            top: gridUnitsToPixels(dragPreview.y),
            width: pixelSize.width,
            height: pixelSize.height,
          }}
        />
      )}
      
      <div
        ref={widgetRef}
        className={`absolute cursor-move transition-all duration-200 ${isDragging ? 'z-50 scale-105 opacity-80' : 'z-10'} ${isResizing ? 'z-50' : ''} group`}
        style={{ left: currentPosition.x, top: currentPosition.y, width: pixelSize.width, height: pixelSize.height }}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <Card className={`w-full h-full ${theme.cardBg} ${theme.border} hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}>
          <CardHeader className="pb-2 relative">
            <CardTitle className={`text-sm font-semibold ${theme.text} flex items-center gap-2`}>
              <Grip className="w-4 h-4 opacity-50" />
              {title}
              <span className="text-xs opacity-50 ml-auto">{gridSize.width}×{gridSize.height}</span>
            </CardTitle>
            
            {showActions && (
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button className={`widget-action p-1.5 rounded-lg ${theme.button} transition-all duration-200 hover:scale-110`} onClick={(e) => e.stopPropagation()} title="Configurações">
                  <Settings className="w-3 h-3" />
                </button>
                <button className={`widget-action p-1.5 rounded-lg ${theme.button} transition-all duration-200 hover:scale-110`} onClick={(e) => { e.stopPropagation(); onDuplicate(id); }} title="Duplicar">
                  <Copy className="w-3 h-3" />
                </button>
                <button className={`widget-action p-1.5 rounded-lg ${theme.button} hover:bg-red-500 hover:text-white transition-all duration-200 hover:scale-110`} onClick={(e) => { e.stopPropagation(); onDelete(id); }} title="Fechar">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="pt-0 h-[calc(100%-60px)]">
            {renderContent()}
          </CardContent>
          
          <div className="resize-handle absolute bottom-0 right-0 w-6 h-6 cursor-se-resize opacity-0 group-hover:opacity-100 transition-all duration-200" onMouseDown={handleResizeStart}>
            <div className={`absolute bottom-1 right-1 w-4 h-4 ${theme.accent}`}>
              <svg viewBox="0 0 16 16" className="w-full h-full">
                <path d="M16 16L16 10L14 12L12 10L10 12L12 14L10 16L16 16Z" fill="currentColor" />
                <path d="M16 16L6 16L8 14L6 12L8 10L10 12L12 10L14 12L16 10L16 16Z" fill="currentColor" opacity="0.6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};


// Background
const GalaxyBackground: React.FC<GalaxyBackgroundProps> = ({ theme }) => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [stars, setStars] = useState<{ id: number; x: number; y: number; size: number; opacity: number; twinkleDelay: number; moveSpeed: number; }[]>([]);
  
  useEffect(() => {
    const newStars = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.8 + 0.2,
      twinkleDelay: Math.random() * 5,
      moveSpeed: Math.random() * 0.5 + 0.1
    }));
    setStars(newStars);
  }, []);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(ellipse at ${mousePos.x}% ${mousePos.y}%, rgba(147, 51, 234, 0.4) 0%, rgba(79, 70, 229, 0.3) 25%, rgba(16, 185, 129, 0.2) 50%, rgba(6, 182, 212, 0.1) 75%, transparent 100%), radial-gradient(ellipse at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(236, 72, 153, 0.3) 0%, rgba(168, 85, 247, 0.2) 30%, transparent 70%), linear-gradient(45deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.95) 50%, rgba(3, 7, 18, 1) 100%)`, transform: `translate(${(mousePos.x - 50) * 0.05}px, ${(mousePos.y - 50) * 0.05}px)` }} />
      <div className="absolute inset-0">
        {stars.map((star) => ( <div key={star.id} className="absolute rounded-full bg-white animate-pulse" style={{ left: `${star.x}%`, top: `${star.y}%`, width: `${star.size}px`, height: `${star.size}px`, opacity: star.opacity, animationDelay: `${star.twinkleDelay}s`, animationDuration: `${2 + Math.random() * 3}s`, transform: `translate(${(mousePos.x - 50) * star.moveSpeed * 0.1}px, ${(mousePos.y - 50) * star.moveSpeed * 0.1}px)`, boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, ${star.opacity * 0.5})` }} /> ))}
      </div>
      <div className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 opacity-20" style={{ background: `conic-gradient(from 0deg, transparent 0deg, rgba(147, 51, 234, 0.3) 30deg, rgba(79, 70, 229, 0.4) 60deg, rgba(16, 185, 129, 0.3) 90deg, transparent 120deg, rgba(236, 72, 153, 0.4) 150deg, transparent 180deg, rgba(168, 85, 247, 0.3) 210deg, transparent 240deg, rgba(59, 130, 246, 0.4) 270deg, transparent 300deg, rgba(147, 51, 234, 0.3) 330deg, transparent 360deg)`, borderRadius: '50%', filter: 'blur(1px)', transform: `translate(${(mousePos.x - 50) * 0.02}px, ${(mousePos.y - 50) * 0.02}px) rotate(${mousePos.x}deg)`, animation: 'spin 120s linear infinite' }} />
      <div className="absolute top-20 right-20 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-600 opacity-60 animate-pulse" style={{ transform: `translate(${(mousePos.x - 50) * 0.03}px, ${(mousePos.y - 50) * 0.03}px)`, boxShadow: '0 0 20px rgba(251, 146, 60, 0.5)' }} />
      <div className="absolute bottom-32 left-16 w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 opacity-50 animate-pulse" style={{ transform: `translate(${(mousePos.x - 50) * 0.02}px, ${(mousePos.y - 50) * 0.02}px)`, animationDelay: '1s', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }} />
      <div className="absolute top-1/3 left-1/4 w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 opacity-40 animate-pulse" style={{ transform: `translate(${(mousePos.x - 50) * 0.04}px, ${(mousePos.y - 50) * 0.04}px)`, animationDelay: '2s', boxShadow: '0 0 12px rgba(147, 51, 234, 0.3)' }} />
      <div className="absolute top-10 left-1/3 w-1 h-20 bg-gradient-to-b from-white to-transparent opacity-60 animate-pulse" style={{ transform: `rotate(45deg) translate(${Math.sin(Date.now() * 0.001) * 50}px, ${Math.cos(Date.now() * 0.001) * 30}px)`, filter: 'blur(0.5px)' }} />
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bg} opacity-70`} style={{ mixBlendMode: theme.name === 'light' ? 'multiply' : 'normal' }} />
    </div>
  );
};

// Topbar
const Topbar: React.FC<TopbarProps> = ({ theme, currentTheme, onThemeChange, isVisible, showGrid, onToggleGrid }) => {
  const themeIcons: { [key: string]: React.ElementType } = {
    light: Sun,
    dark: Moon,
    highContrast: Contrast,
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className={`${theme.topbar} border-b ${theme.border} px-6 py-4`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg"><BarChart3 className="w-6 h-6 text-white" /></div>
              <h1 className={`text-xl font-bold ${theme.text}`}>Dashboard Galático</h1>
            </div>
            <div className="flex items-center gap-2 border-l border-gray-300 pl-6">
              {(Object.keys(themes) as Array<keyof typeof themes>).map((key) => {
                const Icon = themeIcons[key];
                return (
                  <button key={key} onClick={() => onThemeChange(key)} className={`p-3 rounded-xl transition-all duration-200 ${currentTheme === key ? `${theme.accent} bg-blue-100 dark:bg-blue-900 shadow-lg scale-105` : `${theme.button} hover:scale-105`}`} title={themes[key].name}><Icon className="w-5 h-5" /></button>
                );
              })}
              <div className="mx-2 w-px h-8 bg-gray-300" />
              <button onClick={onToggleGrid} className={`p-3 rounded-xl transition-all duration-200 ${showGrid ? `${theme.accent} bg-green-100 dark:bg-green-900 shadow-lg` : `${theme.button}`} hover:scale-105`} title="Toggle Grid"><Menu className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`text-sm ${theme.textSecondary} hidden md:block`}>🚀 Arraste widgets • 📏 Redimensione cantos • ⚡ Grid {GRID_SIZE}px</div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg"><span className="text-white text-sm font-bold">DG</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const Dashboard = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [topbarVisible, setTopbarVisible] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [widgets, setWidgets] = useState<WidgetType[]>([
    { id: '1', title: '💰 Faturamento Mensal', type: 'kpi', gridPosition: { x: 1, y: 3 }, gridSize: { width: 8, height: 6 } },
    { id: '2', title: '📈 Vendas por Período', type: 'line', gridPosition: { x: 10, y: 3 }, gridSize: { width: 12, height: 10 } },
    { id: '3', title: '📊 Pedidos por Mês', type: 'bar', gridPosition: { x: 1, y: 10 }, gridSize: { width: 10, height: 8 } },
    { id: '4', title: '🥧 Produtos Populares', type: 'pie', gridPosition: { x: 23, y: 3 }, gridSize: { width: 8, height: 10 } },
    { id: '5', title: '📋 Relatório Detalhado', type: 'table', gridPosition: { x: 12, y: 14 }, gridSize: { width: 12, height: 10 } }
  ]);
  
  const theme = themes[currentTheme as keyof Themes];
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < 100) {
        setTopbarVisible(true);
        clearTimeout(timeoutId);
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => { setTopbarVisible(false); }, 3000);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, []);
  
  const handleWidgetMove = useCallback((id: string, gridPosition: GridPosition) => {
    setWidgets(widgets => widgets.map(widget => widget.id === id ? { ...widget, gridPosition } : widget));
  }, []);
  
  const handleWidgetResize = useCallback((id: string, gridSize: GridSize) => {
    setWidgets(widgets => widgets.map(widget => widget.id === id ? { ...widget, gridSize } : widget));
  }, []);
  
  const handleWidgetDelete = useCallback((id: string) => {
    setWidgets(widgets => widgets.filter(widget => widget.id !== id));
  }, []);
  
  const handleWidgetDuplicate = useCallback((id: string) => {
    const widget = widgets.find(w => w.id === id);
    if (widget) {
      const newWidget: WidgetType = { ...widget, id: Date.now().toString(), gridPosition: { x: widget.gridPosition.x + 1, y: widget.gridPosition.y + 1 }, title: `${widget.title} (Cópia)` };
      setWidgets(widgets => [...widgets, newWidget]);
    }
  }, [widgets]);
  
  const addNewWidget = () => {
    const types: WidgetType['type'][] = ['kpi', 'line', 'bar', 'pie', 'table'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const icons = ['🚀', '⭐', '🌟', '💫', '🛸', '🌌', '✨', '🔮'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const newWidget: WidgetType = { id: Date.now().toString(), title: `${randomIcon} Novo Widget`, type: randomType, gridPosition: { x: 1 + (widgets.length % 5) * 2, y: 3 + Math.floor(widgets.length / 5) * 2 }, gridSize: { width: 8, height: 6 } };
    setWidgets([...widgets, newWidget]);
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      <GalaxyBackground theme={theme} />
      <GridOverlay show={showGrid} theme={theme} />
      <Topbar theme={theme} currentTheme={currentTheme} onThemeChange={setCurrentTheme} isVisible={topbarVisible} showGrid={showGrid} onToggleGrid={() => setShowGrid(!showGrid)} />
      
      <div className="relative z-10 pt-20 min-h-screen">
        {widgets.map(widget => ( <Widget key={widget.id} {...widget} theme={theme} onMove={handleWidgetMove} onResize={handleWidgetResize} onDelete={handleWidgetDelete} onDuplicate={handleWidgetDuplicate} /> ))}
        
        {showGrid && (
          <div className={`fixed bottom-6 left-6 ${theme.cardBg} ${theme.border} p-4 rounded-xl shadow-2xl z-40`}>
            <div className={`text-sm font-semibold ${theme.text} mb-2`}>⚡ Grid System</div>
            <div className={`text-xs ${theme.textSecondary} space-y-1`}>
              <div>Célula: {GRID_SIZE}px × {GRID_SIZE}px</div>
              <div>Widgets: {widgets.length}</div>
              <div>Min: {MIN_WIDGET_SIZE.width}×{MIN_WIDGET_SIZE.height}</div>
              <div>Max: {MAX_WIDGET_SIZE.width}×{MAX_WIDGET_SIZE.height}</div>
            </div>
          </div>
        )}
      </div>
      
      <button onClick={addNewWidget} className="fixed bottom-6 right-6 w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 z-50 flex items-center justify-center hover:scale-110 group">
        <BarChart3 className="w-8 h-8 group-hover:rotate-12 transition-transform duration-300" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">+</div>
      </button>
      
      <style jsx global>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .widget-action:hover { transform: scale(1.1) rotate(5deg); }
        body { overflow-x: auto; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(45deg, #8b5cf6, #3b82f6); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: linear-gradient(45deg, #7c3aed, #2563eb); }
      `}</style>
    </div>
  );
};

export default Dashboard;