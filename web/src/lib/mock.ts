import type { Reservoir, ReservoirHistory } from "./types";

type Seed = Omit<
  Reservoir,
  | "percentage"
  | "status"
  | "observationTime"
  | "statisticPeriod"
  | "hasStorage"
>;

const seeds: Seed[] = [
  { id: "3", name: "翡翠水庫", region: "北部", county: "新北市", fullCapacity: 33576, currentStorage: 28714, waterLevel: 165.3, waterLevelDiff: 0.1, fullWaterLevel: 170, rainfall: 12.4, inflow: 32.5, outflow: 18.2 },
  { id: "1", name: "石門水庫", region: "北部", county: "桃園市", fullCapacity: 20532, currentStorage: 16128, waterLevel: 240.1, waterLevelDiff: -0.05, fullWaterLevel: 245, rainfall: 8.1, inflow: 24.7, outflow: 22.3 },
  { id: "2", name: "新山水庫", region: "北部", county: "基隆市", fullCapacity: 1004, currentStorage: 812, waterLevel: 92.5, waterLevelDiff: 0.02, fullWaterLevel: 95, rainfall: 14.0, inflow: 1.8, outflow: 1.2 },
  { id: "4", name: "寶山第二水庫", region: "北部", county: "新竹縣", fullCapacity: 3218, currentStorage: 2510, waterLevel: 147.3, waterLevelDiff: 0.0, fullWaterLevel: 150.4, rainfall: 6.0, inflow: 2.1, outflow: 1.9 },
  { id: "5", name: "永和山水庫", region: "中部", county: "苗栗縣", fullCapacity: 2935, currentStorage: 1880, waterLevel: 78.1, waterLevelDiff: -0.1, fullWaterLevel: 81.3, rainfall: 3.2, inflow: 1.0, outflow: 1.8 },
  { id: "6", name: "明德水庫", region: "中部", county: "苗栗縣", fullCapacity: 1626, currentStorage: 980, waterLevel: 57.1, waterLevelDiff: 0.0, fullWaterLevel: 60, rainfall: 4.4, inflow: 1.2, outflow: 1.4 },
  { id: "7", name: "鯉魚潭水庫", region: "中部", county: "苗栗縣", fullCapacity: 11811, currentStorage: 8345, waterLevel: 296.0, waterLevelDiff: 0.0, fullWaterLevel: 300, rainfall: 6.7, inflow: 5.4, outflow: 4.8 },
  { id: "8", name: "德基水庫", region: "中部", county: "台中市", fullCapacity: 17221, currentStorage: 11420, waterLevel: 1392.4, waterLevelDiff: 0.0, fullWaterLevel: 1408, rainfall: 2.8, inflow: 9.2, outflow: 8.7 },
  { id: "9", name: "石岡壩", region: "中部", county: "台中市", fullCapacity: 116, currentStorage: 92, waterLevel: 263.2, waterLevelDiff: 0.0, fullWaterLevel: 265, rainfall: 5.1, inflow: 12.4, outflow: 12.1 },
  { id: "10", name: "霧社水庫", region: "中部", county: "南投縣", fullCapacity: 1404, currentStorage: 720, waterLevel: 999.0, waterLevelDiff: 0.0, fullWaterLevel: 1005, rainfall: 1.9, inflow: 2.3, outflow: 2.1 },
  { id: "11", name: "日月潭水庫", region: "中部", county: "南投縣", fullCapacity: 14127, currentStorage: 13420, waterLevel: 745.0, waterLevelDiff: 0.0, fullWaterLevel: 748.5, rainfall: 3.6, inflow: 8.1, outflow: 7.6 },
  { id: "13", name: "湖山水庫", region: "中部", county: "雲林縣", fullCapacity: 5347, currentStorage: 3210, waterLevel: 192.0, waterLevelDiff: -0.1, fullWaterLevel: 195, rainfall: 2.4, inflow: 1.6, outflow: 1.3 },
  { id: "14", name: "仁義潭水庫", region: "南部", county: "嘉義縣", fullCapacity: 2700, currentStorage: 1485, waterLevel: 92.9, waterLevelDiff: 0.0, fullWaterLevel: 96, rainfall: 1.2, inflow: 0.8, outflow: 1.0 },
  { id: "17", name: "曾文水庫", region: "南部", county: "嘉義縣", fullCapacity: 50635, currentStorage: 28430, waterLevel: 215.2, waterLevelDiff: 0.0, fullWaterLevel: 230, rainfall: 1.0, inflow: 14.1, outflow: 12.8 },
  { id: "16", name: "烏山頭水庫", region: "南部", county: "台南市", fullCapacity: 7873, currentStorage: 5320, waterLevel: 54.8, waterLevelDiff: 0.0, fullWaterLevel: 58.18, rainfall: 0.8, inflow: 11.4, outflow: 10.9 },
  { id: "15", name: "白河水庫", region: "南部", county: "台南市", fullCapacity: 1057, currentStorage: 320, waterLevel: 98.0, waterLevelDiff: 0.0, fullWaterLevel: 102.6, rainfall: 0.6, inflow: 0.4, outflow: 0.7 },
  { id: "18", name: "南化水庫", region: "南部", county: "台南市", fullCapacity: 8631, currentStorage: 4205, waterLevel: 175.4, waterLevelDiff: -0.2, fullWaterLevel: 180, rainfall: 0.9, inflow: 3.2, outflow: 3.0 },
  { id: "19", name: "阿公店水庫", region: "南部", county: "高雄市", fullCapacity: 1973, currentStorage: 980, waterLevel: 32.5, waterLevelDiff: 0.0, fullWaterLevel: 38, rainfall: 0.7, inflow: 0.3, outflow: 0.5 },
  { id: "21", name: "牡丹水庫", region: "南部", county: "屏東縣", fullCapacity: 2660, currentStorage: 1820, waterLevel: 138.4, waterLevelDiff: -0.1, fullWaterLevel: 150, rainfall: 1.8, inflow: 1.5, outflow: 1.3 },
];

function classify(percent: number): Reservoir["status"] {
  if (percent >= 95) return "full";
  if (percent >= 50) return "normal";
  if (percent >= 25) return "low";
  return "critical";
}

export function getMockReservoirs(): Reservoir[] {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const observationTime = now.toISOString();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  return seeds.map((seed) => {
    const percentage =
      Math.round((seed.currentStorage / seed.fullCapacity) * 1000) / 10;
    return {
      ...seed,
      percentage,
      status: classify(percentage),
      hasStorage: true,
      observationTime,
      statisticPeriod: { start, end: observationTime },
    };
  });
}

export function getMockHistory(id: string): ReservoirHistory {
  const reservoirs = getMockReservoirs();
  const target = reservoirs.find((r) => r.id === id) ?? reservoirs[0];
  const now = new Date();
  now.setMinutes(0, 0, 0);

  const fullLevel = target.fullWaterLevel ?? target.waterLevel + 5;

  const points = Array.from({ length: 30 }, (_, i) => {
    const ts = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const drift = Math.sin(i / 4) * 6 + (i - 15) * 0.3;
    const pct = Math.max(5, Math.min(99, target.percentage + drift));
    const waterLevel =
      target.waterLevel - (target.percentage - pct) * (fullLevel / 200);
    return {
      observationTime: ts.toISOString(),
      percentage: Math.round(pct * 10) / 10,
      waterLevel: Math.round(waterLevel * 10) / 10,
    };
  });

  return { id: target.id, points };
}
