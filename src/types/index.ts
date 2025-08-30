import { LucideProps } from 'lucide-react';
import React from 'react';

// Tipos para os dados dos gráficos e KPIs
export interface SalesData {
  month: string;
  sales: number;
  orders: number;
}

export interface ProductData {
  name: string;
  value: number;
  color: string;
}

export interface KpiData {
  title: string;
  value: string;
  change: string;
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
  color: string;
}

// Tipos para os temas da aplicação
export interface Theme {
  name: string;
  bg: string;
  cardBg: string;
  text: string;
  textSecondary: string;
  border: string;
  accent: string;
  button: string;
  topbar: string;
}

export interface Themes {
  light: Theme;
  dark: Theme;
  highContrast: Theme;
}

// Tipos para as propriedades (props) dos componentes
export interface GridPosition {
  x: number;
  y: number;
}

export interface GridSize {
  width: number;
  height: number;
}

export interface WidgetType {
  id: string;
  title: string;
  type: 'kpi' | 'line' | 'bar' | 'pie' | 'table';
  gridPosition: GridPosition;
  gridSize: GridSize;
  data?: any; // Pode ser mais específico se necessário
}

export interface WidgetProps extends WidgetType {
  onMove: (id: string, gridPosition: GridPosition) => void;
  onResize: (id: string, gridSize: GridSize) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  theme: Theme;
  isTransforming?: boolean;
}

export interface GridOverlayProps {
  show: boolean;
  theme: Theme;
}

export interface TopbarProps {
  theme: Theme;
  currentTheme: string;
  onThemeChange: (themeKey: string) => void;
  isVisible: boolean;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export interface GalaxyBackgroundProps {
  theme: Theme;
}