chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
      id: "boldify",
      title: "Make first half of selected words Bold",
      contexts: ["selection"]
    });
  });
  
  chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "boldify") {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: transformSelectedText
      });
    }
  });
  
  function transformSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;
  
    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const textNodes = [];
  
    // Helper function to find text nodes
    function findTextNodes(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
      } else {
        node.childNodes.forEach(findTextNodes);
      }
    }
  
    findTextNodes(fragment);
  
    // Function to apply bold formatting to the first half of each word
    function makeFirstHalfBold(node) {
      const text = node.textContent;
      const words = text.split(/\b/);
      const newHtml = words.map(word => {
        if (word.length === 1) {
          return `<strong>${word}</strong>`;
        } else if (word.length === 3) {
          return `<strong>${word.substr(0, 2)}</strong>${word.substr(2)}`;
        } else {
          const half = Math.floor(word.length / 2);
          return `<strong>${word.substr(0, half)}</strong>${word.substr(half)}`;
        }
      }).join('');
  
      const span = document.createElement('span');
      span.innerHTML = newHtml;
      return span;
    }
  
    // Apply the bold formatting to each text node
    textNodes.forEach(node => {
      const boldNode = makeFirstHalfBold(node);
      node.parentNode.replaceChild(boldNode, node);
    });
  
    // Replace the selected content with the modified fragment
    range.deleteContents();
    range.insertNode(fragment);
  
    // Clear the selection
    selection.removeAllRanges();
  }