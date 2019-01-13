let redirectList = [];

function findSmartRedirectItem(list, selection) {
    return list.find(t => selection.startsWith(t.smartPrefix));
}

function goToItem(item, selection) {
    if (!selection.startsWith(item.smartPrefix)) selection = `${item.smartPrefix}${selection}`
    const url = item.pattern.replace("%s", selection);
    chrome.tabs.create({ url });
}

function withSelection(actionFn) {
    chrome.tabs.query({
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, function (tab) {
        chrome.tabs.sendMessage(tab[0].id, {
            method: 'getSelection'
        }, function (response) {
            if (!response || !response.data) return;
            const selection = response.data.trim();
            if (!selection.length) return;
            actionFn(selection)
        });
    });
}

function itemRedirect(item) {
    if (!item || !item.pattern) return;
    withSelection(function(selection) {
        goToItem(item, selection);
    });
}

function smartRedirect() {
    withSelection(function(selection) {
        const redirectItem = findSmartRedirectItem(redirectList, selection);
        if (!redirectItem) return;
        goToItem(redirectItem, selection);
    });
}

function getItemElement(item) {
    let element = document.createElement('a');
    element.setAttribute("href", "#");
    element.classList.add("list-group-item");
    element.innerText = item.name;
    element.addEventListener('click', function () {
        itemRedirect(item);
    });
    return element;
}

function pushRedirectList() {
    const redirectListContainer = document.getElementById('redirect-list-container');
    for (let i = 0; i < redirectList.length; i++) {
        redirectListContainer.appendChild(getItemElement(redirectList[i]));
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

document.addEventListener('DOMContentLoaded', restoreOptions);

document.querySelector('#go-to-smart').addEventListener('click', function () {
    smartRedirect();
});

document.querySelector('#go-to-options').addEventListener('click', function () {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});