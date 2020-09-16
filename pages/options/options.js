chrome.storage.local.get(['tabSelect', 'autoFillDelay'], function(result) {
    const tabSelect = result.tabSelect;
    const autoFillDelay = result.autoFillDelay;

    if(tabSelect) {
        const checkbox = document.getElementById('tabSelect');
        checkbox.checked = tabSelect;
    }

    if(autoFillDelay) {
        const input = document.getElementById('autoFillDelay');
        input.value = autoFillDelay;
    }
});

document.getElementById('save').addEventListener('click', function(ev) {
    const tabSelect = document.getElementById('tabSelect').checked;
    const delay = document.getElementById('autoFillDelay').value;

    chrome.storage.local.set({
        autoFillDelay: delay,
        tabSelect: tabSelect
    }, function() {
        window.alert('Options Saved!');
    });
});