/*───────────────────────────────────────────────────────────┐
│ FILE: src/constants.js                                     │
└───────────────────────────────────────────────────────────*/

import { shuffle } from './utils/random.js';

/* --------------------------------------------------
   Color palette used for property bars & tokens
   (keys must remain the same; values can be tweaked)
-------------------------------------------------- */
export const COLORS = {
  BROWN     : '#9e6b4a',
  LIGHTBLUE : '#6ec7ff',
  PINK      : '#ff77b7',
  ORANGE    : '#f59e0b',
  RED       : '#ef4444',
  YELLOW    : '#fcd34d',
  GREEN     : '#22c55e',
  DARKBLUE  : '#3b82f6'
};

/* Number of properties in each color-group (classic US board) */
export const GROUP_SIZE = {
  BROWN:2, LIGHTBLUE:3, PINK:3, ORANGE:3,
  RED:3,   YELLOW:3,    GREEN:3, DARKBLUE:2
};

/* --------------------------------------------------
   40-tile board re-themed to Space Colony Monopoly
   – keep t codes the same; names are re-skinned
-------------------------------------------------- */
export const BOARD = [
  { t:'GO',   name:'Launch (Earth) — Collect $200M' },

  // Brown (Earth Orbits)
  { t:'P',    name:'Low Earth Orbit (LEO)',     color:'BROWN',     cost:60,  base:2,  group:'BROWN' },
  { t:'CH',   name:'📡 Mission Control' },
  { t:'P',    name:'Geostationary Orbit (GEO)', color:'BROWN',     cost:60,  base:4,  group:'BROWN' },
  { t:'TAX',  name:'Launch Insurance Fee', cost:200 },

  // Spaceports (Railroads)
  { t:'RR',   name:'Earth Space Elevator',   cost:200 },

  // Light Blue (Inner Solar System)
  { t:'P',    name:'Mercury',                 color:'LIGHTBLUE',   cost:100, base:6,  group:'LIGHTBLUE' },
  { t:'CH?',  name:'💫 Nav. Alert!' },
  { t:'P',    name:'Venus',                   color:'LIGHTBLUE',   cost:100, base:6,  group:'LIGHTBLUE' },
  { t:'P',    name:'Solar Power Satellites',  color:'LIGHTBLUE',   cost:120, base:8,  group:'LIGHTBLUE' },

  // Deep Space (Just Visiting)
  { t:'JAIL', name:'Deep Space' },

  // Pink (Asteroids & Comets)
  { t:'P',    name:'Ceres',                   color:'PINK',        cost:140, base:10, group:'PINK' },
  { t:'UT',   name:'Propellant Depot',        cost:150 },
  { t:'P',    name:'16 Psyche',               color:'PINK',        cost:140, base:10, group:'PINK' },
  { t:'P',    name:'Halley’s Comet',          color:'PINK',        cost:160, base:12, group:'PINK' },

  // Spaceport
  { t:'RR',   name:'Lunar Gateway Station',   cost:200 },

  // Orange (Jovian Moons)
  { t:'P',    name:'Europa',                  color:'ORANGE',      cost:180, base:14, group:'ORANGE' },
  { t:'CH',   name:'📡 Mission Control' },
  { t:'P',    name:'Ganymede',                color:'ORANGE',      cost:180, base:14, group:'ORANGE' },
  { t:'P',    name:'Callisto',                color:'ORANGE',      cost:200, base:16, group:'ORANGE' },

  // Deep Space Station (Free Parking)
  { t:'PARK', name:'Deep Space Station' },

  // Red (Saturn System)
  { t:'P',    name:'Enceladus',               color:'RED',         cost:220, base:18, group:'RED' },
  { t:'CH?',  name:'💫 Nav. Alert!' },
  { t:'P',    name:'Rings of Saturn',         color:'RED',         cost:220, base:18, group:'RED' },
  { t:'P',    name:'Titan',                   color:'RED',         cost:240, base:20, group:'RED' },

  // Spaceport
  { t:'RR',   name:'Mars Spaceport',          cost:200 },

  // Yellow (Uranus & Neptune Frontier)
  { t:'P',    name:'Titania',                 color:'YELLOW',      cost:260, base:22, group:'YELLOW' },
  { t:'P',    name:'Oberon',                  color:'YELLOW',      cost:260, base:22, group:'YELLOW' },
  { t:'UT',   name:'Life Support Services',   cost:150 },
  { t:'P',    name:'Triton',                  color:'YELLOW',      cost:280, base:24, group:'YELLOW' },

  // Lost in Space (Go To Jail)
  { t:'GOTOJAIL', name:'Lost in Space — Stranded in Deep Space' },

  // Green (Distant Dwarf Planets)
  { t:'P',    name:'Pluto & Charon',          color:'GREEN',       cost:300, base:26, group:'GREEN' },
  { t:'P',    name:'Eris',                    color:'GREEN',       cost:300, base:26, group:'GREEN' },
  { t:'CH',   name:'📡 Mission Control' },
  { t:'P',    name:'Haumea',                  color:'GREEN',       cost:320, base:28, group:'GREEN' },

  // Spaceport
  { t:'RR',   name:'Asteroid Belt Outpost',   cost:200 },

  // Deep Space (Chance)
  { t:'CH?',  name:'💫 Nav. Alert!' },

  // Dark Blue (Major Colony Sites)
  { t:'P',    name:'Moon (Luna)',             color:'DARKBLUE',    cost:350, base:35, group:'DARKBLUE' },
  { t:'TAX',  name:'Maintenance Fee', cost:100 },
  { t:'P',    name:'Mars',                    color:'DARKBLUE',    cost:400, base:50, group:'DARKBLUE' }
];

/* --------------------------------------------------
   Mission Control (CHEST) / Deep Space (CHANCE) decks
   – effects unchanged; text re-themed
-------------------------------------------------- */
export function freshChanceDeck() {
  return shuffle([
    { k:'MOVE', to:0,  text:'Gravity Assist! Advance to Launch (collect $200M)' },
    { k:'JAIL',       text:'Solar storm strands your crew — go directly to Deep Space (Lost in Space)' },
    { k:'MOVE', to:11, text:'Slingshot to Ceres' },
    { k:'MOVE', to:24, text:'Course set to Titan' },
    { k:'MOVE', to:39, text:'Fast transfer to Mars' },
    { k:'MOVE', to:5,  text:'Ride the Earth Space Elevator' },
    { k:'GET',  amt:50,  text:'Tech licensing payout — collect $50M' },
    { k:'PAY',  amt:15,  text:'Minor hull repairs — pay $15M' },
    { k:'CARD', which:'GOOJ', text:'Emergency Rescue Beacon (keep)' },
    { k:'GET',  amt:150, text:'Fuel refinery matures — collect $150M' },

    /* not yet implemented by engine — left for future upgrades */
    { k:'NEAREST_UTILITY', text:'Advance to the nearest Utility (pay double rent if owned)' },
    { k:'NEAREST_RR',      text:'Advance to the nearest Spaceport (pay double rent if owned)' },
    { k:'NEAREST_RR',      text:'Advance to the nearest Spaceport (pay double rent if owned)' },
    { k:'BACK3',           text:'Course correction — go back three spaces' },
    { k:'REPAIRS',         text:'General maintenance: $25M per outpost, $100M per colony' },
    { k:'PAY',  amt:0,     text:'Elected Consortium Chair — pay each player $50M' }
  ]);
}

export function freshChestDeck() {
  return shuffle([
    { k:'GET',  amt:200, text:'Public-Private grant — collect $200M' },
    { k:'GET',  amt:200, text:'Funding windfall — collect $200M' },
    { k:'GET',  amt:100, text:'Resupply efficiencies — collect $100M' },
    { k:'GET',  amt:100, text:'Breakthrough bonus — collect $100M' },
    { k:'GET',  amt:50,  text:'Services revenue — collect $50M' },
    { k:'PAY',  amt:100, text:'Medical treatments — pay $100M' },
    { k:'PAY',  amt:50,  text:'Facility upkeep — pay $50M' },
    { k:'PAY',  amt:50,  text:'Training costs — pay $50M' },
    { k:'MOVE', to:0,    text:'Mission completed — advance to Launch (collect $200M)' },
    { k:'JAIL',          text:'Navigation failure — go directly to Deep Space' },
    { k:'CARD', which:'GOOJ', text:'Rescue Beacon — keep' },

    /* not yet implemented by engine — for future logic */
    { k:'REPAIRS', text:'Assessed for station repairs: $40M/outpost, $115M/colony' },
    { k:'GET',  amt:25, text:'Consulting services — collect $25M' },
    { k:'GET',  amt:0,  text:'Public lecture tour — collect $50M from every player' },
    { k:'GET',  amt:100, text:'International grant — collect $100M' },
    { k:'GET',  amt:0,  text:'Discovery celebrated — collect $10M from each player' },
    { k:'GET',  amt:20,  text:'Tax refund — collect $20M' }
  ]);
}

/* --------------------------------------------------
   Canonical property data (names must match BOARD)
   Values unchanged; $ now read as “$M” via UI formatter
-------------------------------------------------- */
export const PROPERTIES = [
  /* BROWN */
  {
    "name": "Low Earth Orbit (LEO)",
    "purchasePrice": 60,
    "mortgagePrice": 30,
    "rent": { "base": 2, "house": [10, 30, 90, 160], "hotel": 250 },
    "houseCost": 50,
    "hotelCost": 50
  },
  {
    "name": "Geostationary Orbit (GEO)",
    "purchasePrice": 60,
    "mortgagePrice": 30,
    "rent": { "base": 4, "house": [20, 60, 180, 320], "hotel": 450 },
    "houseCost": 50,
    "hotelCost": 50
  },

  /* LIGHT BLUE */
  {
    "name": "Mercury",
    "purchasePrice": 100,
    "mortgagePrice": 50,
    "rent": { "base": 6, "house": [30, 90, 270, 400], "hotel": 550 },
    "houseCost": 50,
    "hotelCost": 50
  },
  {
    "name": "Venus",
    "purchasePrice": 100,
    "mortgagePrice": 50,
    "rent": { "base": 6, "house": [30, 90, 270, 400], "hotel": 550 },
    "houseCost": 50,
    "hotelCost": 50
  },
  {
    "name": "Solar Power Satellites",
    "purchasePrice": 120,
    "mortgagePrice": 60,
    "rent": { "base": 8, "house": [40, 100, 300, 450], "hotel": 600 },
    "houseCost": 50,
    "hotelCost": 50
  },

  /* PINK */
  {
    "name": "Ceres",
    "purchasePrice": 140,
    "mortgagePrice": 70,
    "rent": { "base": 10, "house": [50, 150, 450, 625], "hotel": 750 },
    "houseCost": 100,
    "hotelCost": 100
  },
  {
    "name": "16 Psyche",
    "purchasePrice": 140,
    "mortgagePrice": 70,
    "rent": { "base": 10, "house": [50, 150, 450, 625], "hotel": 750 },
    "houseCost": 100,
    "hotelCost": 100
  },
  {
    "name": "Halley’s Comet",
    "purchasePrice": 160,
    "mortgagePrice": 80,
    "rent": { "base": 12, "house": [60, 180, 500, 700], "hotel": 900 },
    "houseCost": 100,
    "hotelCost": 100
  },

  /* ORANGE */
  {
    "name": "Europa",
    "purchasePrice": 180,
    "mortgagePrice": 90,
    "rent": { "base": 14, "house": [70, 200, 550, 750], "hotel": 950 },
    "houseCost": 100,
    "hotelCost": 100
  },
  {
    "name": "Ganymede",
    "purchasePrice": 180,
    "mortgagePrice": 90,
    "rent": { "base": 14, "house": [70, 200, 550, 750], "hotel": 950 },
    "houseCost": 100,
    "hotelCost": 100
  },
  {
    "name": "Callisto",
    "purchasePrice": 200,
    "mortgagePrice": 100,
    "rent": { "base": 16, "house": [80, 220, 600, 800], "hotel": 1000 },
    "houseCost": 100,
    "hotelCost": 100
  },

  /* RED */
  {
    "name": "Enceladus",
    "purchasePrice": 220,
    "mortgagePrice": 110,
    "rent": { "base": 18, "house": [90, 250, 700, 875], "hotel": 1050 },
    "houseCost": 150,
    "hotelCost": 150
  },
  {
    "name": "Rings of Saturn",
    "purchasePrice": 220,
    "mortgagePrice": 110,
    "rent": { "base": 18, "house": [90, 250, 700, 875], "hotel": 1050 },
    "houseCost": 150,
    "hotelCost": 150
  },
  {
    "name": "Titan",
    "purchasePrice": 240,
    "mortgagePrice": 120,
    "rent": { "base": 20, "house": [100, 300, 750, 925], "hotel": 1100 },
    "houseCost": 150,
    "hotelCost": 150
  },

  /* YELLOW */
  {
    "name": "Titania",
    "purchasePrice": 260,
    "mortgagePrice": 130,
    "rent": { "base": 22, "house": [110, 330, 800, 975], "hotel": 1150 },
    "houseCost": 150,
    "hotelCost": 150
  },
  {
    "name": "Oberon",
    "purchasePrice": 260,
    "mortgagePrice": 130,
    "rent": { "base": 22, "house": [110, 330, 800, 975], "hotel": 1150 },
    "houseCost": 150,
    "hotelCost": 150
  },
  {
    "name": "Triton",
    "purchasePrice": 280,
    "mortgagePrice": 140,
    "rent": { "base": 24, "house": [120, 360, 850, 1025], "hotel": 1200 },
    "houseCost": 150,
    "hotelCost": 150
  },

  /* GREEN */
  {
    "name": "Pluto & Charon",
    "purchasePrice": 300,
    "mortgagePrice": 150,
    "rent": { "base": 26, "house": [130, 390, 900, 1100], "hotel": 1275 },
    "houseCost": 200,
    "hotelCost": 200
  },
  {
    "name": "Eris",
    "purchasePrice": 300,
    "mortgagePrice": 150,
    "rent": { "base": 26, "house": [130, 390, 900, 1100], "hotel": 1275 },
    "houseCost": 200,
    "hotelCost": 200
  },
  {
    "name": "Haumea",
    "purchasePrice": 320,
    "mortgagePrice": 160,
    "rent": { "base": 28, "house": [150, 450, 1000, 1200], "hotel": 1400 },
    "houseCost": 200,
    "hotelCost": 200
  },

  /* DARK BLUE */
  {
    "name": "Moon (Luna)",
    "purchasePrice": 350,
    "mortgagePrice": 175,
    "rent": { "base": 35, "house": [175, 500, 1100, 1300], "hotel": 1500 },
    "houseCost": 200,
    "hotelCost": 200
  },
  {
    "name": "Mars",
    "purchasePrice": 400,
    "mortgagePrice": 200,
    "rent": { "base": 50, "house": [200, 600, 1400, 1700], "hotel": 2000 },
    "houseCost": 200,
    "hotelCost": 200
  },

  /* SPACEPORTS (Railroads) */
  {
    "name": "Earth Space Elevator",
    "purchasePrice": 200,
    "mortgagePrice": 100,
    "rent": { "1Owned": 25, "2Owned": 50, "3Owned": 100, "4Owned": 200 },
    "houseCost": null,
    "hotelCost": null
  },
  {
    "name": "Lunar Gateway Station",
    "purchasePrice": 200,
    "mortgagePrice": 100,
    "rent": { "1Owned": 25, "2Owned": 50, "3Owned": 100, "4Owned": 200 },
    "houseCost": null,
    "hotelCost": null
  },
  {
    "name": "Mars Spaceport",
    "purchasePrice": 200,
    "mortgagePrice": 100,
    "rent": { "1Owned": 25, "2Owned": 50, "3Owned": 100, "4Owned": 200 },
    "houseCost": null,
    "hotelCost": null
  },
  {
    "name": "Asteroid Belt Outpost",
    "purchasePrice": 200,
    "mortgagePrice": 100,
    "rent": { "1Owned": 25, "2Owned": 50, "3Owned": 100, "4Owned": 200 },
    "houseCost": null,
    "hotelCost": null
  },

  /* UTILITIES */
  {
    "name": "Propellant Depot",
    "purchasePrice": 150,
    "mortgagePrice": 75,
    "rentFormula": "4 × dice roll; 10 × dice roll if both utilities owned",
    "houseCost": null,
    "hotelCost": null
  },
  {
    "name": "Life Support Services",
    "purchasePrice": 150,
    "mortgagePrice": 75,
    "rentFormula": "4 × dice roll; 10 × dice roll if both utilities owned",
    "houseCost": null,
    "hotelCost": null
  }
];
