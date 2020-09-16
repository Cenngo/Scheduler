let bgPage;
chrome.runtime.getBackgroundPage(function(window) {
    bgPage = window;
});

// Initial state setter for the toggle button
chrome.alarms.getAll(function(alarms) {
    if(alarms.some(x => x.name == 'scheduler_final')) changeBtnState(true);
    else changeBtnState(false);
});

// Delegate between toggle and the background task 
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if(message.name != 'autoRefreshProcess') return;

    const state = message.state;
    changeBtnState(state);

    sendResponse({});
});

// Display function for the saved data
chrome.storage.local.get(['savedClasses', 'addDropDate'], function(result) {
    savedClasses = result.savedClasses;
    const list = document.getElementsByClassName('classes')[0];

    if(savedClasses) {
        for(var index = 0; index < savedClasses.length; index++){
            const cl = savedClasses[index];
            const item = document.createElement('li');

            const deleteBtn = `<strong>${cl.Crn}</strong> | ${cl.Code} | <strong>${cl.Title}</strong> <button type="button" class="btn btn-outline-danger float-right removeRow"><svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg></button>`;

            item.innerHTML = deleteBtn;
            item.className = 'list-group-item bg-dark text-light';
            item.id = cl.Crn;
            
            list.appendChild(item);
            item.addEventListener("click", (ev) => {
                removeRow(ev.target.closest('li'));
            });
        }
    }

    if(result.addDropDate) document.getElementById('date').value = result.addDropDate;
});

document.getElementById('date').addEventListener("input", (ev) => {
    chrome.storage.local.set({addDropDate: ev.target.value}, function() {
    });
});
document.getElementById('clrBookmarks').addEventListener("click", (ev) => {
    clearBookmarks();
});
document.getElementById('createBookmarklet').addEventListener("click", (ev) => {
    createBookmarklet();
});
document.getElementById('execRun').addEventListener("click", (ev) => {
    bgPage.startExec();
});
document.getElementById('execStop').addEventListener("click", (ev) => {
    bgPage.stopExec();
});
document.getElementById('manualFill').addEventListener("click", (ev) => {
    manualFill();
});
document.getElementById('options').addEventListener("click", (ev) => {
    chrome.runtime.openOptionsPage();
});

function clearBookmarks(){
    if(!window.confirm("Clear All Bookmarks?")) return;

    chrome.storage.local.set({savedClasses: []}, function() {
        console.log("All Bookmarks Cleared");
        window.location.reload();
    });
}

function removeRow(row){
    chrome.storage.local.get('savedClasses', function(result) {
        var savedClasses = result.savedClasses;
        const index = savedClasses.findIndex(x => x.Crn == row.id);
        savedClasses.splice(index, 1);

        chrome.storage.local.set({savedClasses: savedClasses}, function() {
            window.location.reload();
        })
    });
}

function createBookmarklet(){
    chrome.storage.local.get('savedClasses', function(result) {
        const savedClasses = result.savedClasses;
        if(savedClasses.length <= 0) {
            window.alert("There are no saved classes!");
            return;
        }
        var crns = [];
        var arrString;

        Array.from(savedClasses).forEach(x => {
            crns.push(x.Crn);
        });
        arrString = crns.join(',');
        const script = `javascript:(function()%7Bcrns %3D %5B${arrString}%5D%3Bfor(i %3D 0%3B i < crns.length%3B i%2B%2B)%7Bdocument.getElementById(%60crn_id%24%7Bi%2B1%7D%60).value %3D crns%5Bi%5D%3Bdocument.getElementById('foo1').click()%3B%7D%7D)()`;

        chrome.bookmarks.create({'parentId': '1' ,'index': 0 , 'title': 'CRN Doldur!', 'url': script});
        alert('Bookmark Created');
    });
}

function manualFill() {
    chrome.storage.local.get('savedClasses', function(result) {
        const savedClasses = result.savedClasses;
        const classArr = savedClasses.map(x => x.Crn);

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {name: 'scheduler_fillClasses', classes: classArr, isManual: true}, function(response) {
                console.log(`Content Script Transaction >> Status : ${response.status}, Url : ${response.url}`);
            });
        });
    });
}

function changeBtnState(isActive) {

    const deactive = [...document.getElementsByClassName('deactive')];
    deactive.forEach((value) => {
        if(isActive) value.classList.add('d-none');
        else value.classList.remove('d-none');
    });

    const active = [...document.getElementsByClassName('active')];
    active.forEach((value) => {
        if(isActive) value.classList.remove('d-none');
        else value.classList.add('d-none');
    });
}