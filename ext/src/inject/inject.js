
async function delay (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

class LichessAdapater {
  async init() {
    const timeout = 20000
    const waitDuration = 100
    let curWait = 0
    while (curWait < timeout && document.getElementsByTagName('piece').length === 0) {
      await delay(waitDuration)
      curWait += waitDuration
    }
    return document.getElementsByTagName('piece').length >= 0
  }

  async findPieceElement(pieceClass) {
    const board = document.getElementsByTagName('cg-board')[0]
    const pieces = board.getElementsByTagName('piece')
    for (const p of pieces) {
      if (p.classList.value === pieceClass) {
        return p
      }
    }
  }
}

async function setStyle(adapter) {
  const status = await adapter.init()
  if(status) {
    const el = await adapter.findPieceElement('white king')
    const garfield = 'https://cdn160.picsart.com/upscale-272578841007211.png'
    el.style.backgroundImage = `url('${garfield}')`
  } else {
    console.log('timeout waiting for init')
  }
}

chrome.extension.sendMessage({}, function (response) {
  const adapter = new LichessAdapater()
  const readyStateCheckInterval = setInterval(async function () {
    if (document.readyState === 'complete') {
      clearInterval(readyStateCheckInterval)
      setStyle(adapter)

      window.addEventListener('resize', () => {
        setStyle(adapater)
      })
    }
  }, 10)
})
