export type HousingType = 'smahus' | 'flerbostadshus';
export type HousingView = 'current' | '2060';

export interface HousingUnitProperties {
  id: string;
  municipality: string;
  type: HousingType;
  view: HousingView | 'both';
}

export type HousingUnit = GeoJSON.Feature<GeoJSON.Polygon, HousingUnitProperties>;
export type HousingCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, HousingUnitProperties>;
