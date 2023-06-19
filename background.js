chrome.tabs.onUpdated.addListener((tabId, tab) => {
    if (!tab.url) {
        return
    }

    if (!tab.url.includes('youtube.com/watch')) {
        return
    }

    const queryParameters = tab.url.split("?").pop()

    const urlParameters = new URLSearchParams(queryParameters)

    chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        videoId: urlParameters.get("v")
    })
})
  