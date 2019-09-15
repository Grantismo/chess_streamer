// Piece Enums
const Color = {
  BLACK: 'black',
  WHITE: 'white',
};

const Piece = {
  KING: 'k',
  QUEEN: 'q',
  ROOK: 'r',
  KNIGHT: 'n',
  BISHOP: 'b',
  PAWN: 'p',
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
    const macher = new PieceMatcher().addColor(Color.WHITE).addPiece(Piece.KING);
    const el = await adapter.findElements(matcher);
    if (!el) {
      console.log('could not find piece');
      return;
    }
    const garfield = 'https://cdn160.picsart.com/upscale-272578841007211.png';
    el.style.backgroundImage = `url('${garfield}')`;
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
      if (this.match(p, matcher)) {
        matches.push(p)
        return p;
      }
    }
    return matches;
  }

  async match(element, matcher) {
    for(const p of matcher.pieces) {
      if(!this.matchPiece(element, p) {
        return false;
      }
    }

    for(const c of matcher.colors) {
      if(!this.matchColor(element, c) {
        return false;
      }
    }

    for(const c of matcher.coords) {
      if(!this.matchCoord(element, c) {
        return false;
      }
    }
    return true;
  }

  async matchColor(element, color) {
    return false;
  }

  async matchPiece(element, piece) {
    //.classList.value === pieceClass
    return false;
  }

  async matchCoord(element, coord) {
    //TODO
    return false;
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
