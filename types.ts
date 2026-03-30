
export interface MetricYoY {
  current: number;
  previous: number;
  variation?: string;
  diff?: number;
}

export interface Campaign {
  name: string;
  source: string;
  investment: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  cpa: number;
}

export interface Creative {
  name: string;
  investment: MetricYoY;
  impressions: MetricYoY;
  clicks: MetricYoY;
  conversions: MetricYoY;
  revenue: MetricYoY;
  daysRunning: number;
  url: string;
  analysis?: string;
  metricNames?: {
    conversions: string;
    revenue: string;
    efficiency: string;
  };
}

export interface PlatformData {
  name: string;
  investment: MetricYoY;
  impressions: MetricYoY;
  clicks: MetricYoY;
  conversions: MetricYoY;
  revenue: MetricYoY;
  roas: MetricYoY;
  cpa: MetricYoY;
  pct: MetricYoY;
}

export interface DashboardData {
  periodStart: string;
  periodEnd: string;
  periodLyStart?: string;
  periodLyEnd?: string;
  
  investment: MetricYoY;
  impressions: MetricYoY;
  cliques: MetricYoY;
  conversions: MetricYoY;
  receita: MetricYoY;
  roas: MetricYoY;
  cpa: MetricYoY;
  ctr: MetricYoY;
  
  platforms: PlatformData[];
  
  ga4?: {
    sessions: MetricYoY;
    users: MetricYoY;
    transactions: MetricYoY;
    revenue: MetricYoY;
    conversionRate: MetricYoY;
    avgTicket: MetricYoY;
  };
  
  vtex?: {
    revenue: MetricYoY;
    orders: MetricYoY;
    avgTicket: MetricYoY;
  };
  
  campaigns: Campaign[];
  creatives?: Creative[];
  exportType?: 'PERFORMANCE' | 'CREATIVE';
}
