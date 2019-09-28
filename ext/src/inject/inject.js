// Piece Enums
const Color = {
  BLACK: 'black',
  WHITE: 'white'
};

const Piece = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  PAWN: 'pawn'
};

// Utilities
async function waitWithTimeout (predicate, timeout = 20000, waitDuration = 100) {
  let curWait = 0;
  while (curWait < timeout && !predicate()) {
    await delay(waitDuration);
    curWait += waitDuration;
  }
  return predicate();
}

async function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function addClasses(innerHtml) {
  const styleId = 'chess-streamer-classes';
  let style = document.getElementById(styleId);
  if(!style) {
    style = document.createElement('style');
    style.type = 'text/css';
    style.id = styleId;
    document.getElementsByTagName('head')[0].appendChild(style);
  }
  style.innerHTML = innerHtml;
}

class PieceMatcher {
  constructor () {
    this.pieces = [];
    this.colors = [];
    this.coords = [];
  }

  addPiece (piece) {
    this.pieces.push(piece);
    return this;
  }

  addColor (color) {
    this.colors.push(color);
    return this;
  }

  addCoord (coord) {
    this.coords.push(coord);
    return this;
  }

  match (element) {
    for (const p of this.pieces) {
      if (!this.matchPiece(element, p)) {
        return false;
      }
    }

    for (const c of this.colors) {
      if (!this.matchColor(element, c)) {
        return false;
      }
    }

    for (const c of this.coords) {
      if (!this.matchCoord(element, c)) {
        return false;
      }
    }
    return true;
  }

  matchColor (color) {
    throw new Error('no implementation.');
  }

  matchPiece (piece) {
    throw new Error('no implementation.');
  }

  matchCoord (coord) {
    throw new Error('no implementation.');
  }
}

class LichessMatcher extends PieceMatcher {
  matchColor (element, color) {
    return element.classList.contains(color);
  }

  matchPiece (element, piece) {
    return element.classList.contains(piece);
  }

  matchCoord (element, coord) {
    // TODO using math
    return false;
  }
}

class ChessDotComMatcher extends PieceMatcher {
  matchColor (element, color) {
    // backgroundImage of the form url('images.chesscomfiles.com/.../wr.png')
    const bgImageColor = element.style.backgroundImage.slice(-8, -7); // w or b
    return color.startsWith(bgImageColor);
  }

  matchPiece (element, piece) {
    const bgImagePiece = element.style.backgroundImage.slice(-7, -6); //k, q, r, n, p, b
    if (piece !== 'knight' && piece !== 'king') {
      return piece.startsWith(bgImagePiece);

    }
    return  piece === 'king' ? bgImagePiece === 'k': bgImagePiece === 'n'; // knight
  }

  matchCoord (element, coord) {
    // TODO using coord class
    return false;
  }
}


class PieceReplacer {
  constructor (matcher, image, cssClass) {
    this.matcher = matcher;
    this.image = image;
    this.cssClass = cssClass;
  }

  async apply (adapter) {
    const status = await adapter.init();
    if (status) {
      const els = await adapter.findElements(this.matcher);
      if (els.length === 0) {
        console.log('could not find piece');
        return;
      }
      for (let i = 0; i < els.length; i++) {
        els[i].classList.add(this.cssClass);
      }
    } else {
      console.log('timeout waiting for init');
    }
  }
}

function parseText (adapter, text) {
  const lines = text.split('\n');
  const replacements = [];
  for (let i = 0; i < lines.length; i++) {
    if(lines[i].length > 0 && lines[i][0] === '#'){
        console.log('skipping');
        continue; // skip comments
    }
    const line = lines[i].split(',');
    if (line.length === 2) {
      const match = adapter.newMatcher(line[0]);
      const image = line[1];
      const replacer = new PieceReplacer(match, image, 'chess-streamer-r' + i);
      replacements.push(replacer);
    } else {
      console.log('unexpected line length');
    }
  }
  return replacements;
}

class SiteAdapter {
  constructor () {
    this.matcherClass = null;
  }

  async apply (replacements) {
    let cssRules = '';
    for (let i = 0; i < replacements.length; i++) {
      cssRules += `
        .${replacements[i].cssClass} {
          background-image: url(${replacements[i].image}) !important;
          background-repeat: no-repeat;
        }`;
    }
    addClasses(cssRules);

    for (let i = 0; i < replacements.length; i++) {
      await replacements[i].apply(this);
    }
  }

  async findElements (matcher) {
    const pieces = this.findPieces();
    const matches = [];
    if (pieces.length === 0) {
      console.log('no pieces found');
    }
    for (const p of pieces) {
      if (matcher.match(p)) {
        matches.push(p);
      }
    }
    return matches;
  }

  async init () {
    throw new Error('no implementation.');
  }

  findPieces() {
    throw new Error('no implementation.');
  }

  matcherClass() {
    throw new Error('no implementation.');
  }

  whiteOrientation () {
    throw new Error('no implementation.');
  }

  newMatcher (line) {
    const coordRegex = /^[a-h][1-8]$/;
    const matcher = new this.matcherClass;
    const parts = line.split(/\s+/); // 'white knight f3'
    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === 'us' || parts[i] === 'them') {
        matcher.addColor(((parts[i] === 'us') === this.whiteOrientation()) ? 'white' : 'black')
      } 
      if (Object.values(Color).indexOf(parts[i]) > -1) {
        matcher.addColor(parts[i]);
      } if (Object.values(Piece).indexOf(parts[i]) > -1) {
        matcher.addPiece(parts[i]);
      } else if (coordRegex.test(parts[i])) {
        matcher.addCoord(parts[i]);
      }
    }
    return matcher;
  }
}

// Site Specific Adapters
class LichessAdapter extends SiteAdapter {
  constructor () {
    super();
    this.matcherClass = LichessMatcher;
  }

  async init () {
    return waitWithTimeout(() => document.getElementsByTagName('piece').length > 0);
  }

  findPieces() {
    const board = document.getElementsByTagName('cg-board')[0];
    return board.getElementsByTagName('piece');
  }

  whiteOrientation () {
    const wrapper = document.getElementsByTagName('cg-board')[0].closest('.cg-wrap');
    return wrapper.classList.contains('orientation-white');
  }
}


class ChessDotComAdapter extends SiteAdapter{
  constructor () {
    super();
    this.matcherClass = ChessDotComMatcher;
  }

  async init () {
    return waitWithTimeout(() => document.getElementsByClassName('piece').length > 0);
  }

  findPieces() {
    const board = document.getElementById('game-board');
    return board.getElementsByClassName('piece');
  }

  whiteOrientation () {
    return !document.getElementById('game-board').classList.contains('flipped');
  }
}

async function applyReplacements(adapter, text) {
  if (text.length > 0) {
    const replacements = parseText(adapter, text);
    await adapter.apply(replacements);
    console.log('replacements applied!');

    window.addEventListener('resize', async () => {
      await delay(50); // causes flickering on resize, but if too low may not refresh.
      await adapter.apply(replacements);
    });
  } else {
    console.log('no replacements found');
  }
}

// Main
chrome.extension.sendMessage({}, function (response) {}); // notify background of ready state.

function getAdapter() {
  const currentUrl = document.location.toString();
  if(currentUrl.indexOf('chess.com') > -1) {
    return new ChessDotComAdapter();
  } else if (currentUrl.indexOf('lichess') > -1) {
    return new LichessAdapter();
  }
  throw new Error('no adapter for this site.');
}

const adapter = getAdapter();
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  await applyReplacements(adapter, request.text);
});

chrome.storage.sync.get(['text'], async function(result) {
  await applyReplacements(adapter, result.text);
});
