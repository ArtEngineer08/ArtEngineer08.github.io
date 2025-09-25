/*───────────────────────────────────────────────────────────┐
│ FILE: src/mechanics/cards.js                              │
└───────────────────────────────────────────────────────────*/
import { BOARD, freshChanceDeck, freshChestDeck } from '../constants.js';
import { game }            from '../state/gameState.js';
import { pay, receive, addToPot } from './economy.js';
import { positionTokens }  from '../ui/boardRender.js';
import { tileAction, goToJail, enqueue } from './movement.js';
import { log, money }      from '../utils/dom.js';

let CHANCE_DECK = [];
let CHEST_DECK  = [];

export function resetDecks() {
  CHANCE_DECK = freshChanceDeck();
  CHEST_DECK  = freshChestDeck();
}

export function drawCard(pid, which) {
  const p    = game.players[pid];
  const deck = which === 'CHANCE' ? CHANCE_DECK : CHEST_DECK;

  const card = deck.shift();
  deck.push(card);

  log(`Card drawn: ${card.text}`);

  switch (card.k) {
    case 'GET': {
      const amt = card.amt | 0;
      enqueue(pid, `Receive ${money(amt)}`, () => {
        receive(p, amt, 'Card');
      });
      break;
    }

    case 'PAY': {
      const amt = card.amt | 0;
      enqueue(pid, `Pay ${money(amt)}`, () => {
        pay(p, amt, 'Card');
        addToPot(amt);
      });
      break;
    }

    case 'MOVE': {
      const to = card.to | 0;
      if (to < p.pos) {
        enqueue(pid, `Receive ${money(200)}`, () => {
          receive(p, 200, 'passing Launch');
        });
      }
      const destName = BOARD[to]?.name || 'destination';
      enqueue(pid, `Advance to ${destName}`, () => {
        p.pos = to;
        positionTokens();
        tileAction(pid);
      });
      break;
    }

    case 'JAIL': {
      enqueue(pid, 'Go to Deep Space (Lost in Space)', () => {
        goToJail(pid);
      });
      break;
    }

    case 'CARD': {
      if (card.which === 'GOOJ') {
        p.gooj += 1;
        log(`${p.name} keeps a Rescue Beacon.`);
      }
      break;
    }

    default:
      break;
  }
}
