chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.name != 'scheduler_fillClasses') return;

    fillCrn(message.classes, message.isManual);
    sendResponse({status: 'successfull', url: window.location.host});
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.name != 'retrieveContextItem') return;

    const activeElement = document.activeElement;
    const element = {id: activeElement.id, tag: activeElement.tagName};

    sendResponse({element: element});
});

function fillCrn(classes, isManual) {
    if(!isManual && document.location.href != 'https://web.itu.edu.tr/durgunor/crn.html') {
        navigateToOpPage();
    }

    if(document.getElementsByClassName('dataentrytable')) {
        for(var index = 0; index < 10 && index < classes.length; index++) {
            const field = document.querySelector(`#crn_id${index + 1}`);
            
            field.value = classes[index];
        }
        
        const btn = document.querySelector('#foo1');
        btn.click();
        console.log(`Submitted on ${(new Date()).toLocaleTimeString()}`);
    }
}

function navigateToOpPage() {
    chrome.storage.local.get('navBtn', function(result) {
        const btn = result.navBtn;
        const selector = `${btn.tag.toLowerCase()}#${btn.id}`;

        document.querySelector(selector).click();
    });
}