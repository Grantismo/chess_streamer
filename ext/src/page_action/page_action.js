function sendText () {
  console.log('on click');
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const text = document.getElementById('text').value;
    chrome.tabs.sendMessage(tabs[0].id, { text: text });
  });
}

document.getElementById('apply').addEventListener('click', sendText);
