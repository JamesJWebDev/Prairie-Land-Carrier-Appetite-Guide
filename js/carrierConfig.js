/**
 * Carrier list and base weights by product (auto, home, commercial).
 * Base weights reflect agency positioning; eligibility/weight logic lives in suggestions.js.
 */
export const CARRIER_CONFIG = {
  auto: [
    { name: 'Progressive Insurance', baseWeight: 3.5, key: 'progressiveAuto' },
    { name: 'Travellers Insurance', baseWeight: 3.2, key: 'travellersAuto' },
    { name: 'Erie Insurance', baseWeight: 3.1, key: 'erieAuto' },
    { name: 'Wisconsin Mutual', baseWeight: 3.4, key: 'wisconsinMutualAuto' },
    { name: 'Foremost', baseWeight: 2.7, key: 'foremostAuto' },
    { name: 'Liberty Mutual (Safeco)', baseWeight: 2.7, key: 'libertyAuto' },
    { name: 'Donegal', baseWeight: 2.6, key: 'donegalAuto' },
    { name: 'Grinnell', baseWeight: 2.6, key: 'grinnellAuto' },
    { name: 'Dairyland', baseWeight: 2.4, key: 'dairylandAuto' },
  ],
  home: [
    { name: 'Erie Insurance', baseWeight: 3.5, key: 'erieHome' },
    { name: 'Progressive Insurance', baseWeight: 3.1, key: 'progressiveHome' },
    { name: 'Wisconsin Mutual', baseWeight: 3.0, key: 'wisconsinMutualHome' },
    { name: 'Travellers Insurance', baseWeight: 3.0, key: 'travellersHome' },
    { name: 'Foremost', baseWeight: 2.7, key: 'foremostHome' },
    { name: 'Liberty Mutual (Safeco)', baseWeight: 2.7, key: 'libertyHome' },
    { name: 'Donegal', baseWeight: 2.6, key: 'donegalHome' },
    { name: 'Grinnell', baseWeight: 2.6, key: 'grinnellHome' },
    { name: 'Dairyland', baseWeight: 2.4, key: 'dairylandHome' },
  ],
  commercial: [
    { name: 'Travellers Insurance', baseWeight: 3.3, key: 'travellersComm' },
    { name: 'Grinnell', baseWeight: 3.2, key: 'grinnellComm' },
    { name: 'Donegal', baseWeight: 3.2, key: 'donegalComm' },
    { name: 'Erie Insurance', baseWeight: 2.9, key: 'erieComm' },
    { name: 'Progressive Insurance', baseWeight: 2.7, key: 'progressiveComm' },
    { name: 'Wisconsin Mutual', baseWeight: 2.6, key: 'wisconsinMutualComm' },
    { name: 'Liberty Mutual (Safeco)', baseWeight: 2.2, key: 'libertyComm' },
    { name: 'Foremost', baseWeight: 2.5, key: 'foremostComm' },
    { name: 'Dairyland', baseWeight: 2.4, key: 'dairylandComm' },
  ],
};
