/*───────────────────────────────────────────────────────────┐
│ FILE: src/utils/dom.js                                    │
└───────────────────────────────────────────────────────────*/

/**
 * Convenience DOM helpers used everywhere.
 */

export function $(id) {
  return document.getElementById(id);
}

export function $all(sel, scope = document) {
  return Array.from(scope.querySelectorAll(sel));
}

export function el(tag, props = {}, kids = []) {
  const node = document.createElement(tag);

  for (const [key, val] of Object.entries(props)) {
    if (key === 'dataset' && val && typeof val === 'object') {
      for (const [dKey, dVal] of Object.entries(val)) {
        node.dataset[dKey] = dVal;
      }
    } else if (key === 'style' && typeof val === 'object') {
      Object.assign(node.style, val);
    } else {
      node[key] = val;
    }
  }

  kids.forEach(k => node.append(k));
  return node;
}

/**
 * Money formatter — Space-Opoly shows millions: $200M, $1,500M, etc.
 * @param {number} n
 * @returns {string} e.g. "$1,500M"
 */
export function money(n) {
  return `$${n.toLocaleString('en-US')}M`;
}

/**
 * On-screen log helper with dashed separators between entries.
 * @param {string} msg
 */
export function log(msg) {
  const logEl = $('log');
  if (!logEl) return;

  if (logEl.childElementCount > 0) {
    const sep = el('div', {
      className : 'entry sep',
      textContent: '- - - - - - - - - - - - - - - - - -'
    });
    logEl.append(sep);
  }

  const div = el('div', { className: 'entry', textContent: msg });
  logEl.append(div);

  logEl.scrollTop = logEl.scrollHeight;
}
