const CONTEXT_MENU_ID_PREFIX = "issueRedirect_";

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

function withRedirectList(actionFn) {
    chrome.storage.sync.get({
        redirectList: []
    }, function(data) {
        const redirectList = data && data.redirectList || [];
        actionFn(redirectList);
    });
}

function smartRedirect() {
    withSelection(function(selection) {
        withRedirectList(function(redirectList) {
            const redirectItem = findSmartRedirectItem(redirectList, selection);
            if (!redirectItem) return;
            goToItem(redirectItem, selection);
        });
    });
}

chrome.commands.onCommand.addListener(function(command) {
    if (command === 'smart-redirect') {
        smartRedirect();
    }
});

chrome.runtime.onInstalled.addListener(function() {
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
});