export type Region = "北部" | "中部" | "南部" | "東部" | "離島";

export interface Reservoir {
  id: string;
  name: string;
  region: Region;
  county: string;
  fullCapacity: number;
  currentStorage: number;
  percentage: number;
  waterLevel: number;
  waterLevelDiff: number | null;
  fullWaterLevel: number | null;
  rainfall: number;
  inflow: number;
  outflow: number;
  status: "normal" | "low" | "critical" | "full" | "unknown";
  hasStorage: boolean;
  observationTime: string;
  statisticPeriod: { start: string; end: string } | null;
}

export interface ReservoirHistoryPoint {
  observationTime: string;
  percentage: number;
  waterLevel: number;
}

export interface ReservoirHistory {
  id: string;
  points: ReservoirHistoryPoint[];
}

export interface TrendPoint {
  date: string;
  percentage: number;
}

export interface NationalTrend {
  points: TrendPoint[];
  contributors: number;
}

export interface UpstreamReservoir {
  id: number;
  name: string;
  capavailable: number;
  statisticTimeS: string;
  statisticTimeE: string;
  rainFall: number | null;
  inFlow: number | null;
  outFlow: number | null;
  waterlevediff: number | null;
  recordTime: string;
  caplevel: number | null;
  currcap: number | null;
  currcapper: number | null;
}
