export const STOCKHOLM_CENTER: [number, number] = [18.07, 59.33];
export const STOCKHOLM_BOUNDS: [[number, number], [number, number]] = [
  [17.5, 58.65],
  [19.1, 60.25],
];
export const OVERVIEW_PITCH = 0;
export const OVERVIEW_BEARING = 0;
export const DEFAULT_PITCH = 55;
export const DEFAULT_BEARING = -20;

export const MUNICIPALITY_OUTLINE_HOVER_LAYER = 'municipalities-outline-hover';
export const MUNICIPALITY_DIM_LAYER = 'municipalities-dim';
export const MUNICIPALITY_LABELS_ALL_LAYER = 'municipality-labels-all';
export const MUNICIPALITY_LABELS_SELECTED_LAYER = 'municipality-labels-selected';

export const SMAHUS_LAYER_ID = 'smahus-extrusion';
export const FLERBOSTADSHUS_CURRENT_LAYER_ID = 'flerbostadshus-current-extrusion';
export const FLERBOSTADSHUS_NEW_LAYER_ID = 'flerbostadshus-new-extrusion';

export const SMAHUS_COLOR = '#4A90D9';
export const FLERBOSTADSHUS_COLOR = '#2C5282';
export const FLERBOSTADSHUS_NEW_COLOR = '#D64045';

// Map palette — blue-gray, matching the site. The map canvas sits slightly
// lighter than the page and nudged a touch grayer (Request 1) so the blue housing
// extrusions (esp. existing apartments, #2C5282) separate a bit more from the
// surface. The 3D building colors above are intentionally left untouched.
export const MAP_BG_COLOR = '#4d5765'; // map canvas — slightly grayer, a touch lighter than the page
export const NEIGHBOR_FILL_COLOR = MAP_BG_COLOR; // neighboring regions blend into the map canvas
// Stockholm-region municipality land — a lighter gray so the region stands out
// against the darker background + neighboring regions (still below the outline
// color so boundaries stay legible).
export const MUNICIPALITY_FILL_COLOR = '#646f7c';
export const MUNICIPALITY_OUTLINE_COLOR = '#9aa9bd';
export const MUNICIPALITY_DIM_COLOR = '#1c2733'; // dims non-selected municipalities
export const MUNICIPALITY_HOVER_FILL_COLOR = '#c7d2e0'; // light highlight on hover
export const MUNICIPALITY_SELECT_COLOR = '#b91c1c'; // selection outline — keep accent red
export const LABEL_COLOR = '#cdd6e2';
export const LABEL_SELECTED_COLOR = '#f2f0eb';
export const LABEL_HALO_COLOR = '#1c2733';

export const SMAHUS_PER_REPRESENTATIVE = 50;
export const FLERBOSTADSHUS_PER_REPRESENTATIVE = 500;
