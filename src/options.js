let redirectList = [];

function pullRedirectList() {
    const redirectListContainer = document.getElementById('redirect-list-container');
    let resList = [];
    for (let i = 0; i < redirectListContainer.childNodes.length; i++) {
        const fieldNode = redirectListContainer.childNodes[i];
        const resItem = {
            name: fieldNode.childNodes[0].firstChild.value,
            pattern: fieldNode.childNodes[1].firstChild.value,
            smartPrefix: fieldNode.childNodes[2].firstChild.value
        };
        if (!resItem.name || !resItem.pattern) return false;
        resList.push(resItem);
    }
    redirectList = resList;
    return true;
}

function generateRedirectItemElement(redirectItem) {
    let element = document.createElement('tr');
    ['name', 'pattern', 'smartPrefix'].forEach(field => {
        let fieldElement = document.createElement('td');
        let inputElement = document.createElement('input');
        inputElement.setAttribute('type', 'text');
        inputElement.setAttribute('value', redirectItem[field] || '');
        fieldElement.appendChild(inputElement);
        element.appendChild(fieldElement);
    });
    let actionsElement = document.createElement('td');
    let removeButtonElement = document.createElement('div');
    removeButtonElement.classList.add('btn');
    removeButtonElement.classList.add('btn-default');
    let removeButtonIconElement = document.createElement('span');
    removeButtonIconElement.classList.add('glyphicon');
    removeButtonIconElement.classList.add('glyphicon-remove');
    removeButtonIconElement.setAttribute('aria-hidden', 'true');
    removeButtonElement.appendChild(removeButtonIconElement);
    removeButtonElement.addEventListener('click', function () {
        redirectList.splice(redirectList.indexOf(redirectItem), 1);
        pushRedirectList();
    });
    actionsElement.appendChild(removeButtonElement);
    element.appendChild(actionsElement);
    return element;
}

function pushRedirectList() {
    const redirectListContainer = document.getElementById('redirect-list-container');
    redirectListContainer.innerHTML = '';

    if (!redirectList.length) {
        let fullRowElement = document.createElement('td');
        fullRowElement.setAttribute('colspan', '4');
        let warningElement = document.createElement('div');
        warningElement.classList.add('alert');
        warningElement.classList.add('alert-warning');
        warningElement.innerText = 'Add some items';
        fullRowElement.appendChild(warningElement);
        redirectListContainer.appendChild(fullRowElement);
        return;
    }

    for (let i = 0; i < redirectList.length; i++) {
        redirectListContainer.appendChild(generateRedirectItemElement(redirectList[i]));
    }
}

function setError(errorMessage) {
    let errorElement = document.getElementById('error');
    if (errorElement) errorElement.remove();
    if (!errorMessage) return;

    errorElement = document.createElement('span');
    errorElement.setAttribute('id', 'error');
    errorElement.classList.add('redirect-list-error');
    errorElement.innerText = `* ${errorMessage}`;
    document.getElementById('footer').appendChild(errorElement);
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
    setError(null);

    const pullRes = pullRedirectList();
    if (!pullRes) {
        setError("fill all required fields");
        return;
    }

    chrome.storage.sync.set({
        redirectList: redirectList
    }, function () {
        pushRedirectList();
        chrome.runtime.sendMessage({method: "refreshContextMenus"});
    });
}

function addItem() {
    redirectList.push({});
    pushRedirectList();
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
document.getElementById('add').addEventListener('click', addItem);