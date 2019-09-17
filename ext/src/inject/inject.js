// Piece Enums
const Color = {
  BLACK: 'black',
  WHITE: 'white',
};

const Piece = {
  KING: 'king',
  QUEEN: 'queen',
  ROOK: 'rook',
  KNIGHT: 'knight',
  BISHOP: 'bishop',
  PAWN: 'pawn',
};


// Utilities
async function waitWithTimeout(predicate, timeout=20000, waitDuration=100) {
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

class PieceMatcher {
  pieces = [];
  colors = [];
  coords = [];

  addPiece(piece) {
    this.pieces.push(piece);
    return this;
  }

  addColor(color) {
    this.colors.push(color);
    return this;
  }

  addCoord(coord) {
    this.coords.push(coord);
    return this;
  }

  match(element) {
    for(const p of this.pieces) {
      if(!this.matchPiece(element, p)) {
        return false;
      }
    }

    for(const c of this.colors) {
      if(!this.matchColor(element, c)) {
        return false;
      }
    }

    for(const c of this.coords) {
      if(!this.matchCoord(element, c)) {
        return false;
      }
    }
    return true;
  }

  matchColor(color) {
    throw new Error('no implementation.');
  }

  matchPiece(piece) {
    throw new Error('no implementation.');
  }

  matchCoord(coord) {
    throw new Error('no implementation.');
  }
}

class LichessMatcher extends PieceMatcher {
  matchColor(element, color) {
    return element.classList.contains(color);
  }

  matchPiece(element, piece) {
    return element.classList.contains(piece);
  }

  matchCoord(element, coord) {
    // TODO using math
    return false;
  }
}

const coordRegex = /^[a-h][1-8]$/;
function newPieceMatcher(text) {
  const parts = text.split(/\s+/); // white knight f3
  const matcher = new PieceMatcher();
  for(let i = 0; i < parts.length; i++){
    if(Object.values(Color).indexOf(parts[i]) > -1) {
      matcher.addColor(parts[i]);
    if(Object.values(Piece).indexOf(parts[i]) > -1) {
      matcher.addPiece(parts[i]);
    } else if (coordRegex.test(parts[i])) {
      matcher.addCoord(parts[i]);
    }
  }
  return matcher;
}


class PieceReplacer { 
  constructor(matcher, image) {
    this.matcher = matcher;
    this.image = image;
  }

  async apply(adapter) {
    const status = await adapter.init();
    if (status) {
      const els = await adapter.findElements(this.matcher);
      if (els.length == 0) {
        console.log('could not find piece');
        return;
      }
      for(let i = 0; i < els.length; i++) {
        els[i].style.backgroundImage = `url('${this.image}')`;
      }
    } else {
      console.log('timeout waiting for init');
    }
  }
}

function parseText (text) {
  const lines = text.split("\n");
  const replacements = [];
  for (let i = 0; i < lines.length; i++) {
    const line = text.split("\n");
    if(line.length == 2){
      const match = newPieceMatcher(line[0]);
      const image = line[1];
      const replacer = PieceReplacer(matcher, image);
      replacements.push(replacer);
    } else {
      console.log('unexpected line length');
    }
  }
  return replacements;
}


// Site Specific Adapters
class LichessAdapater {
  async init () {
    return waitWithTimeout(() => document.getElementsByTagName('piece').length > 0);
  }

  async findElements (matcher) {
    const board = document.getElementsByTagName('cg-board')[0];
    const pieces = board.getElementsByTagName('piece');
    const matches = [];
    if(pieces.length == 0) {
      console.log('no pieces found');
    }
    for (const p of pieces) {
      if (matcher.match(p)) {
        matches.push(p);
      }
    }
    return matches;
  }

  newMatcher() {
    return new LichessMatcher;
  }

  async apply(replacements) {
    for (let i = 0; i < replacements; i++) {
      await replacements[i].apply(this);
    }
  }
}

// Main
chrome.extension.sendMessage({}, function (response) {
});




setStyle(adapter);

const adapter = new LichessAdapater();
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if(request.text.length > 0) {
    const replacements = parseText(request.text);
    adapter.apply(replacements);

    window.addEventListener('resize', async () => {
      await delay(50); // causes flickering on resize, but if too low may not refresh.
      adapter.apply(replacements);
    });
  } else {
    console.log('no replacements found');
  }
});
