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

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.name != 'navigateToPage') return;

    navigateToOpPage();
    sendResponse();
});

function fillCrn(classes, isManual) {
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
    document.getElementsByClassName('submenulinktext2')[5].click();

    // const termSelect = document.getElementsByClassName('dataentrytable');
    // if (termSelect.length == 1) {
    //     const submit = document.getElementsByTagName('input')[2];
    //     submit.click();
    // }
}