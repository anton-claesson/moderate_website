export const STOCKHOLM_CENTER: [number, number] = [18.07, 59.33];
export const DESKTOP_MAP_PADDING = { top: 0, bottom: 0, left: 0, right: 320 };
export const MOBILE_MAP_PADDING = { top: 0, bottom: 0, left: 0, right: 0 };
export const DESKTOP_BREAKPOINT = 768;
export const STOCKHOLM_BOUNDS: [[number, number], [number, number]] = [
  [17.25, 58.9],
  [19.1, 59.85],
];
export const OVERVIEW_PITCH = 0;
export const OVERVIEW_BEARING = 0;
export const DEFAULT_PITCH = 45;
export const DEFAULT_BEARING = -15;

export const SMAHUS_LAYER_ID = 'smahus-extrusion';
export const FLERBOSTADSHUS_CURRENT_LAYER_ID = 'flerbostadshus-current-extrusion';
export const FLERBOSTADSHUS_NEW_LAYER_ID = 'flerbostadshus-new-extrusion';

export const SMAHUS_COLOR = '#7BAE79';
export const FLERBOSTADSHUS_COLOR = '#5C8B5A';
export const FLERBOSTADSHUS_NEW_COLOR = '#E8A838';

export const SMAHUS_PER_REPRESENTATIVE = 100;
export const FLERBOSTADSHUS_PER_REPRESENTATIVE = 1000;

// Footprint half-sizes in degrees (~55m and ~110m at Stockholm latitude)
export const SMAHUS_SIZE_DEG = 0.0005;
export const FLERBOSTADSHUS_SIZE_DEG = 0.001;
export const SMAHUS_HEIGHT_M = 10;
export const FLERBOSTADSHUS_HEIGHT_M = 40;

// Placement offsets per layer type — keeps types from overlapping each other
export const SMAHUS_LAT_OFFSET = 0.012; // småhus placed north of centroid
export const FLERBOSTADSHUS_LAT_OFFSET = 0; // current apartments at centroid
export const FLERBOSTADSHUS_NEW_LAT_OFFSET = -0.012; // new apartments placed south
