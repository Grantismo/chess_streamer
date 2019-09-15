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

const coordRegex = /[a-h][1-8]/;

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

async function setStyle (adapter) {
  const status = await adapter.init();
  if (status) {
    const matcher = adapter.newMatcher().addColor(Color.WHITE).addPiece(Piece.PAWN);
    const els = await adapter.findElements(matcher);
    if (els.length == 0) {
      console.log('could not find piece');
      return;
    }
    const garfield = 'https://cdn160.picsart.com/upscale-272578841007211.png';
    for(let i = 0; i < els.length; i++) {
      debugger;
      els[i].style.backgroundImage = `url('${garfield}')`;
    }
  } else {
    console.log('timeout waiting for init');
  }
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
    //TODO
    throw new Error('no implementation.');
  }
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

}

// Main
chrome.extension.sendMessage({}, function (response) {
  const adapter = new LichessAdapater();
  const readyStateCheckInterval = setInterval(async function () {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval);
      setStyle(adapter);

      window.addEventListener('resize', () => {
        setStyle(adapater);
      });
    }
  }, 10);
});
