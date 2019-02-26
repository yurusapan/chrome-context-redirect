chrome.runtime.getBackgroundPage(function(background) {
    const selectionInputElement = document.getElementById('selection-input');

    background.withSelection(function(selection) {
        selectionInputElement.value = selection;
    })

    function withInputText(actionFn) {
        const inputText = selectionInputElement.value;
        if (!inputText || !inputText.length) return;
        actionFn(inputText.trim());
    }

    function smartRedirect() {
        withInputText(function(inputText) {
            background.smartRedirectCore(inputText);
        });
    }

    function getItemElement(item) {
        let element = document.createElement('a');
        element.setAttribute("href", "#");
        element.classList.add("list-group-item");
        element.innerText = item.name;
        element.addEventListener('click', function () {
            withInputText(function(inputText) {
                background.goToItem(item, inputText);
            });
        });
        return element;
    }

    function pushRedirectList(redirectList) {
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
        background.withRedirectList(function(redirectList) {
            pushRedirectList(redirectList);
        });
    }
    restoreOptions();

    //document.addEventListener('DOMContentLoaded', restoreOptions);

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
});