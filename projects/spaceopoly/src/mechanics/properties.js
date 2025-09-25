/*───────────────────────────────────────────────────────────┐
│ FILE: src/mechanics/properties.js                         │
└───────────────────────────────────────────────────────────*/
import { BOARD, GROUP_SIZE, PROPERTIES } from '../constants.js';
import { game }                 from '../state/gameState.js';
import { pay, transfer }        from './economy.js';
import { updateSidebars }       from '../ui/sidebar.js';
import { applyOwnershipStyles } from '../ui/boardRender.js';
import { log, money }           from '../utils/dom.js';
import { rollDie }              from '../utils/random.js';
import { showCtx }              from '../ui/ctxMenu.js';
import { enqueue }              from './movement.js';

const spec = idx => PROPERTIES.find(p => p.name === BOARD[idx].name);

function baseRent(idx, ownerId) {
  const tile = BOARD[idx];
  const s    = spec(idx);
  const ownedInGroup = game.players[ownerId].props
                        .filter(i => BOARD[i].group === tile.group).length;
  const mono = ownedInGroup === GROUP_SIZE[tile.group];
  const base = s.rent?.base ?? tile.base;
  return mono ? base * 2 : base;
}

export function calcRentP(idx, ownerId) {
  const h = game.houses[idx];
  const s = spec(idx);
  if (h >= 5) return s.rent.hotel * (h - 4);
  if (h >= 1) return s.rent.house[h - 1];
  return baseRent(idx, ownerId);
}

/* Build / Sell — wording uses Outpost/Colony, costs unchanged */
function canBuild(pid, idx) {
  if (game.owners[idx] !== pid)          return false;
  if (game.mortgages[idx])               return false;
  const group = BOARD[idx].group;
  const owned = game.players[pid].props.filter(i => BOARD[i].group === group);
  return owned.length === GROUP_SIZE[group];
}

function build(pid, idx) {
  const p = game.players[pid];
  const s = spec(idx);
  const h = game.houses[idx] || 0;

  const cost = (h < 4) ? s.houseCost : (h === 4 ? s.hotelCost : 5 * s.houseCost);
  if (p.cash < cost) return;

  pay(p, cost, h === 4 ? 'build colony' : 'build outpost');
  game.houses[idx] = h + 1;
  log(`${p.name} built ${h < 4 ? 'an outpost' : (h === 4 ? 'a colony' : 'another colony')} on ${s.name}.`);
  applyOwnershipStyles();
  updateSidebars();
}

function canSell(pid, idx) {
  return game.owners[idx] === pid && (game.houses[idx] || 0) > 0;
}

function sell(pid, idx) {
  const p = game.players[pid];
  const s = spec(idx);
  const h = game.houses[idx] || 0;
  if (h <= 0) return;

  const refund = Math.floor((h >= 6 ? 5 * s.houseCost : (h === 5 ? s.hotelCost : s.houseCost)) / 2);
  p.cash += refund;
  game.houses[idx] = h - 1;

  log(`${p.name} sold ${h >= 5 ? 'a colony' : 'an outpost'} on ${s.name} for ${money(refund)}.`);
  applyOwnershipStyles();
  updateSidebars();
}

/* Landing handlers */
export function landP(pid, idx) {
  const p     = game.players[pid];
  const owner = game.owners[idx];

  if (owner == null) {
    game.awaitingPurchase = idx;
    log(`${p.name} may buy ${BOARD[idx].name} for ${money(spec(idx).purchasePrice)}.`);
    updateSidebars();
    return;
  }
  if (owner === pid) { log('Your own site.'); return; }
  if (game.mortgages[idx]) { log('Site is decommissioned — no rent.'); return; }

  const rent = calcRentP(idx, owner);
  enqueue(pid, `Pay rent, ${money(rent)}`, () => {
    transfer(p, game.players[owner], rent, 'rent');
    updateSidebars();
  });
}

export function landRR(pid, idx) {
  const p     = game.players[pid];
  const owner = game.owners[idx];

  if (owner == null) {
    game.awaitingPurchase = idx;
    log(`${p.name} may buy ${BOARD[idx].name} for ${money(spec(idx).purchasePrice)}.`);
    updateSidebars();
    return;
  }
  if (owner === pid) { log('Your own spaceport.'); return; }
  if (game.mortgages[idx]) { log('Spaceport is decommissioned — no fee.'); return; }

  const rrOwned = game.players[owner].props
                    .filter(i => BOARD[i].t === 'RR' && !game.mortgages[i]).length;

  const rentTable = spec(idx).rent;
  const rent = rentTable[`${Math.min(rrOwned, 4)}Owned`];

  enqueue(pid, `Pay spaceport fee, ${money(rent)}`, () => {
    transfer(p, game.players[owner], rent, 'spaceport fee');
    updateSidebars();
  });
}

export function landUT(pid, idx) {
  const p     = game.players[pid];
  const owner = game.owners[idx];

  if (owner == null) {
    game.awaitingPurchase = idx;
    log(`${p.name} may buy ${BOARD[idx].name} for ${money(spec(idx).purchasePrice)}.`);
    updateSidebars();
    return;
  }
  if (owner === pid) { log('Your own service.'); return; }
  if (game.mortgages[idx]) { log('Service is decommissioned — no fee.'); return; }

  enqueue(pid, `Roll & pay service fee`, () => {
    const a = rollDie(), b = rollDie();
    const total = a + b;

    const utOwned = game.players[owner].props
                      .filter(i => BOARD[i].t === 'UT' && !game.mortgages[i]).length;

    const mult = utOwned >= 2 ? 10 : 4;
    const fee = total * mult;

    transfer(p, game.players[owner], fee, 'service fee');
    log(`Service fee: rolled ${a}+${b}=${total} × ${mult} = ${money(fee)}.`);
    updateSidebars();
  });
}

/* Purchase */
export function buyProperty(pid) {
  const idx = game.awaitingPurchase;
  if (idx == null) return;

  const p    = game.players[pid];
  const s    = spec(idx);
  const cost = s.purchasePrice;

  if (p.cash < cost) {
    log('Not enough cash.');
    updateSidebars();
    return;
  }

  game.owners[idx] = pid;
  p.cash          -= cost;
  p.props.push(idx);

  log(`${p.name} bought ${BOARD[idx].name} for ${money(cost)}.`);
  game.awaitingPurchase = null;

  applyOwnershipStyles();
  updateSidebars();
}

/* Context menu for tiles & pills */
export function propertyMenu(pid, idx, openAt) {
  const items = [];
  const owner = game.owners[idx];
  const s     = spec(idx);

  if (owner == null) {
    items.push(
      { label:'Give to Player 1', action:()=>{ game.owners[idx]=0; game.players[0].props.push(idx); applyOwnershipStyles(); updateSidebars(); } },
      { label:'Give to Player 2', action:()=>{ game.owners[idx]=1; game.players[1].props.push(idx); applyOwnershipStyles(); updateSidebars(); } }
    );
    showCtx(items, ...openAt);
    return;
  }

  const other     = 1 - owner;
  const mortgaged = game.mortgages[idx];

  items.push(
    { label:`Give to ${game.players[other].name}`, action:()=>{
        game.owners[idx]=other;
        game.players[owner].props = game.players[owner].props.filter(i=>i!==idx);
        game.players[other].props.push(idx);
        log(`${game.players[owner].name} gave ${s.name} to ${game.players[other].name}.`);
        applyOwnershipStyles(); updateSidebars();
      } },
    mortgaged
      ? { label:`Recommission (-${money(s.mortgagePrice)})`, action:()=>{
          if (game.players[owner].cash < s.mortgagePrice) return;
          pay(game.players[owner], s.mortgagePrice, 'recommission');
          game.mortgages[idx] = false;
          applyOwnershipStyles(); updateSidebars();
        } }
      : { label:`Decommission asset (+${money(s.mortgagePrice)})`, action:()=>{
          game.players[owner].cash += s.mortgagePrice;
          game.mortgages[idx] = true;
          applyOwnershipStyles(); updateSidebars();
        } }
  );

  if (BOARD[idx].t === 'P') {
    const h    = game.houses[idx] || 0;
    const canB = canBuild(owner, idx);
    const cost = (h < 4) ? s.houseCost : (h === 4 ? s.hotelCost : 5 * s.houseCost);

    items.push({ label:'—' });
    items.push({
      label   : (h < 4) ? `Build outpost (-${money(cost)})` : (h === 4 ? `Build colony (-${money(cost)})` : `Build +1 colony (-${money(cost)})`),
      action  : () => build(owner, idx),
      disabled: !canB
    });
    if (!canB) items.push({ label:'Need sector control (no decommission)', action:()=>{}, disabled:true });

    const canS   = canSell(owner, idx);
    const refund = h > 0 ? Math.floor((h >= 6 ? 5 * s.houseCost : (h === 5 ? s.hotelCost : s.houseCost)) / 2) : 0;

    items.push({
      label   : h > 0 ? ((h >= 5) ? `Sell colony (+${money(refund)})` : `Sell outpost (+${money(refund)})`) : 'Sell (no buildings)',
      action  : () => sell(owner, idx),
      disabled: !canS
    });
  }

  showCtx(items, ...openAt);
}
