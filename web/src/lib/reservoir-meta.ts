import type { Region } from "./types";

export interface ReservoirMeta {
  region: Region;
  county: string;
  fullWaterLevel: number | null;
}

export const META_BY_NAME: Record<string, ReservoirMeta> = {
  石門水庫: { region: "北部", county: "桃園市", fullWaterLevel: 245 },
  新山水庫: { region: "北部", county: "基隆市", fullWaterLevel: 95 },
  翡翠水庫: { region: "北部", county: "新北市", fullWaterLevel: 170 },
  寶山第二水庫: { region: "北部", county: "新竹縣", fullWaterLevel: 150.4 },
  永和山水庫: { region: "中部", county: "苗栗縣", fullWaterLevel: 81.3 },
  明德水庫: { region: "中部", county: "苗栗縣", fullWaterLevel: 60 },
  鯉魚潭水庫: { region: "中部", county: "苗栗縣", fullWaterLevel: 300 },
  德基水庫: { region: "中部", county: "台中市", fullWaterLevel: 1408 },
  石岡壩: { region: "中部", county: "台中市", fullWaterLevel: 265 },
  霧社水庫: { region: "中部", county: "南投縣", fullWaterLevel: 1005 },
  日月潭水庫: { region: "中部", county: "南投縣", fullWaterLevel: 748.5 },
  集集攔河堰: { region: "中部", county: "南投縣", fullWaterLevel: 245 },
  湖山水庫: { region: "中部", county: "雲林縣", fullWaterLevel: 195 },
  仁義潭水庫: { region: "南部", county: "嘉義縣", fullWaterLevel: 96 },
  曾文水庫: { region: "南部", county: "嘉義縣", fullWaterLevel: 230 },
  白河水庫: { region: "南部", county: "台南市", fullWaterLevel: 102.6 },
  烏山頭水庫: { region: "南部", county: "台南市", fullWaterLevel: 58.18 },
  南化水庫: { region: "南部", county: "台南市", fullWaterLevel: 180 },
  阿公店水庫: { region: "南部", county: "高雄市", fullWaterLevel: 38 },
  高屏溪攔河堰: { region: "南部", county: "高雄市", fullWaterLevel: null },
  牡丹水庫: { region: "南部", county: "屏東縣", fullWaterLevel: 150 },
};

export function metaFor(name: string): ReservoirMeta {
  return (
    META_BY_NAME[name] ?? {
      region: "北部",
      county: "—",
      fullWaterLevel: null,
    }
  );
}
