import {getCurrentTab} from "./utils.js";

const addNewBookmark = (bookmarksElement, bookmark) => {
    const title = document.createElement("div");
    const element = document.createElement("div");
    const controls = document.createElement("div");

    title.textContent = bookmark.description;
    title.className = "bookmark-tile";

    element.id = "bookmark-" + bookmark.time;
    element.className = "bookmark";
    element.setAttribute("timestamp", bookmark.time);

    controls.className = "bookmark-controls";
    setBookmarkAttributes("play", onPlay,  controls);
    setBookmarkAttributes("delete", onDelete,  controls);

    element.appendChild(title);
    element.appendChild(controls);

    bookmarksElement.appendChild(element);
};

const viewBookmarks = (bookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if (bookmarks.length > 0) {
        bookmarks.map(bookmark => {
            addNewBookmark(bookmarksElement, bookmark)
        })
    } else {
        bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>'
    }
};

const onPlay = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const activeTab = await getCurrentTab();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime
    })
};

const onDelete = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmark = document.getElementById("bookmark-" + bookmarkTime);
    const activeTab = await getCurrentTab();

    bookmark.parentNode.removeChild(bookmark);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime
    }, viewBookmarks)
};

const setBookmarkAttributes =  (src, action, parent) => {
    const control = document.createElement("img");

    control.src = "assets/" + src + ".png";
    control.title = src;

    control.addEventListener("click", action);

    parent.appendChild(control);
};

document.addEventListener("DOMContentLoaded", async () => {
    const currentTab = await getCurrentTab();

    const queryParameters = currentTab.url.split("?").pop();

    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v")

    if (currentTab.url.includes("youtube.com/watch") && currentVideo) {

        console.log(currentVideo);
        chrome.storage.sync.get([currentVideo], (obj) => {
            const currentVideoBookmarks = obj[currentVideo] ? JSON.parse(obj[currentVideo]) : [];

            console.log(currentVideoBookmarks);
            viewBookmarks(currentVideoBookmarks);
        })
    } else {
        let container = [...document.getElementsByClassName("container")].shift()

        container.innerHTML = '<div class="title">This is not a Youtube page</div>'
    }
});
