export const getCurrentTab = async () => {
    let queryOptions = { active: true, currentWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

export const getCurrentVideoId = async () => {
    const tab = await getCurrentTab();

    const queryParameters = currentTab.url.split("?").pop();

    const urlParameters = new URLSearchParams(queryParameters);

    return urlParameters.get("v")
}