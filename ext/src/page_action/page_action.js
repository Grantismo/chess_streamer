function sendText () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const text = document.getElementById('text').value;
    chrome.tabs.sendMessage(tabs[0].id, { text: text });
    chrome.storage.sync.set({text: text}, function() {});
  });
}

chrome.storage.sync.get(["text"], function(result) {
  console.log(result.text);
  if (result.text.length > 0) {
    document.getElementById('text').value = result.text;
  }
});

document.getElementById('apply').addEventListener('click', sendText);
