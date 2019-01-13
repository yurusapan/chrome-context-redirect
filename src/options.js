let redirectList = [];

function pullRedirectList() {
    redirectList = [
        {
            name: "NatLex - YouTrack",
            pattern: "https://natlex.myjetbrains.com/youtrack/issue/%s",
            smartPrefix: "N-"
        }, {
            name: "ITC - Jira",
            pattern: "https://itc-20.com/jira/browse/%s",
            smartPrefix: "IRIS-"
        }
    ];
}

function pushRedirectList() {
    const redirectListContainer = document.getElementById('redirect-list-container');

    for (let i = 0; i < redirectList.length; i++) {
        redirectListContainer.innerText = redirectList[i].name;
    }
}

function restoreOptions() {
    chrome.storage.sync.get({
        redirectList: []
    }, function(data) {
        redirectList = data && data.redirectList || [];
        pushRedirectList();
    });
}

function saveOptions() {
    pullRedirectList();

    chrome.storage.sync.set({
        redirectList: redirectList
    }, function () {
        pushRedirectList();
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);