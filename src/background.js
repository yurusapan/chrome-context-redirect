const CONTEXT_MENU_ID_PREFIX = "issueRedirect_";

function findSmartRedirectItem(list, selection) {
    return list.find(t => selection.startsWith(t.smartPrefix));
}

function goToItem(item, selection) {
    if (!selection.startsWith(item.smartPrefix)) selection = `${item.smartPrefix}${selection}`
    const url = item.pattern.replace("%s", selection);
    chrome.tabs.create({ url });
}

function withRedirectList(actionFn) {
    chrome.storage.sync.get({
        redirectList: []
    }, function(data) {
        const redirectList = data && data.redirectList || [];
        actionFn(redirectList);
    });
}

function withSelection(actionFn) {
    chrome.tabs.executeScript({
        code: "window.getSelection().toString();"
    }, function(res) {
        if (!res || !res.length) return;
        const selection = res[0];
        if (!selection || !selection.length) return;
        actionFn(selection.trim());
    });
}

function smartRedirectCore(selection) {
    withRedirectList(function(redirectList) {
        const redirectItem = findSmartRedirectItem(redirectList, selection);
        if (!redirectItem) return;
        goToItem(redirectItem, selection);
    });
}

function smartRedirect() {
    withSelection(function(selection) {
        smartRedirectCore(selection);
    });
}

chrome.commands.onCommand.addListener(function(command) {
    if (command === 'smart-redirect') {
        smartRedirect();
    }
});

function refreshContextMenus() {
    chrome.contextMenus.removeAll(function() {
        withRedirectList(function(redirectList) {
            if (!redirectList.length) return;
    
            for (let i = 0; i < redirectList.length; i++) {
                const item = redirectList[i];
                chrome.contextMenus.create({
                    "id": `${CONTEXT_MENU_ID_PREFIX}${i}`,
                    "title": item.name,
                    "contexts": ["selection"]
                });
            }
        });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method === "refreshContextMenus") {
        refreshContextMenus();
    }
});

chrome.runtime.onInstalled.addListener(function() {
    refreshContextMenus();
});

chrome.contextMenus.onClicked.addListener(function(info) {
    if (!info.menuItemId.startsWith(CONTEXT_MENU_ID_PREFIX)) return;
    const itemIndex = info.menuItemId.substring(CONTEXT_MENU_ID_PREFIX.length);
    
    withRedirectList(function(redirectList) {
        if (!redirectList.length || !redirectList[itemIndex]) return;
        withSelection(function(selection) {
            goToItem(redirectList[itemIndex], selection);
        });
    });
});