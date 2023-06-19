(() => {
    let youtubeLeftControls, youtubePlayer;

    let currentVideo = "";
    let currentVideoBookmarks = [];

    chrome.runtime.onMessage.addListener((req, sender, res) => {
        const { type, value, videoId } = req

        if (type === "NEW") {
            currentVideo = videoId;
            newVideoLoaded();
        }

        if (type === "PLAY") {
            youtubePlayer.currentTime = value;
        }

        if (type === "DELETE") {
            currentVideoBookmarks = currentVideoBookmarks.filter(it => it.timestamp != value);

            chrome.storage.sync.set({[currentVideo]: JSON.stringify(currentVideoBookmarks)});

            res(currentVideoBookmarks);
        }
    });

    const getBookmarks = () => {
        return new Promise((resolve) => {
            chrome.storage.sync.get([currentVideo], (obj) => {
                resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
            })
        })
    }

    const newVideoLoaded = async () => {
        const bookmarkButton = [...document.getElementsByClassName("bookmark-btn")].shift()

        currentVideoBookmarks = await getBookmarks();

        if (!bookmarkButton) {
            const bookmarkBtnImg = document.createElement("img")

            bookmarkBtnImg.src = chrome.runtime.getURL("assets/bookmark.png")
            bookmarkBtnImg.className = "ytp-button " + "bookmark-btn"
            bookmarkBtnImg.title = "Click to bookmark current timestamp"

            youtubeLeftControls = [...document.getElementsByClassName("ytp-left-controls")].shift()
            youtubePlayer = [...document.getElementsByClassName("video-stream")].shift()

            youtubeLeftControls.appendChild(bookmarkBtnImg)

            bookmarkBtnImg.addEventListener("click", storeBookmarkHandler)
        }
    };

    const storeBookmarkHandler = async () => {
        const currentTime = youtubePlayer.currentTime;

        const newBookmark = {
            time: currentTime,
            description: "Bookmark at " + getTime(currentTime)
        };

        currentVideoBookmarks = await getBookmarks();

        // const currentVideoId = await getCurrentVideoId();

        console.log(currentVideo);
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        })

        chrome.storage.sync.get([currentVideo], (obj) => {
            console.log(obj[currentVideo])
        })
    }

    newVideoLoaded();
})();

const getTime = (seconds) => {
    let date = new Date(seconds * 1000);

    return date.toISOString().substring(11, 23);
}
