chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({type: "normal", title: 'Set this item as navigaion button', contexts: ['page'], id: 'schedulerCtx',
    documentUrlPatterns: ["https://web.itu.edu.tr/durgunor/crn.html/*", "http://ssb.sis.itu.edu.tr:9000/pls/PROD/*"], 
    enabled: true});
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    chrome.tabs.sendMessage(tab.id, {name: 'retrieveContextItem'}, function(response) {
        if(!response.element) return;

        const element = response.element;

        chrome.storage.local.set({navBtn: element}, function() {
        });
    });
});