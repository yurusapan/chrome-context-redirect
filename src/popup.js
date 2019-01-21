let redirectList = [];
let background = chrome.extension.getBackgroundPage();

function smartRedirect() {
    background.withSelection(function(selection) {
        const redirectItem = background.findSmartRedirectItem(redirectList, selection);
        if (!redirectItem) return;
        background.goToItem(redirectItem, selection);
    });
}

function getItemElement(item) {
    let element = document.createElement('a');
    element.setAttribute("href", "#");
    element.classList.add("list-group-item");
    element.innerText = item.name;
    element.addEventListener('click', function () {
        background.itemRedirect(item);
    });
    return element;
}

function pushRedirectList() {
    const redirectListContainer = document.getElementById('redirect-list-container');

    if (!redirectList.length) {
        let warningElement = document.createElement('div');
        warningElement.classList.add('alert');
        warningElement.classList.add('alert-warning');
        warningElement.innerText = 'No configuration';
        redirectListContainer.appendChild(warningElement);
        return;
    }

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