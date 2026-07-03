export type DashboardMetric = {
  label: string;
  value: string | number;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'neutral';
};

export type DashboardWidget = {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'map' | 'list';
  size: 'small' | 'medium' | 'large';
};
