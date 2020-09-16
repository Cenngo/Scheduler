const nonExisting = `<button class="btn btn-info"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-bookmark-plus-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm4.5 4.5a.5.5 0 0 0-1 0V6H6a.5.5 0 0 0 0 1h1.5v1.5a.5.5 0 0 0 1 0V7H10a.5.5 0 0 0 0-1H8.5V4.5z"/>
    </svg></button>`;

const existing = `<button class="btn btn-success"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-check2-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" d="M15.354 2.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L8 9.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
    <path fill-rule="evenodd" d="M8 2.5A5.5 5.5 0 1 0 13.5 8a.5.5 0 0 1 1 0 6.5 6.5 0 1 1-3.25-5.63.5.5 0 1 1-.5.865A5.472 5.472 0 0 0 8 2.5z"/>
    </svg></button>`;

chrome.storage.local.get('savedClasses', function(result) {
    const savedClasses = result.savedClasses;

    insertBtns(savedClasses);
})

function insertBtns(savedClasses)
{
    const progTables = document.getElementsByClassName('dersprg');
    if(!progTables){
        throw "No Class Table Found";
    }

    const progTable = progTables[0];
    const rows = progTable.getElementsByTagName('tr');

    for(var index = 2; index < rows.length; index++){
        const row = rows[index];
        const dataCell = row.getElementsByTagName('td')[0];

        const btn = document.createElement('div');
        btn.className = 'scheduler_btn';

        btn.innerHTML = checkExistance(savedClasses, dataCell.innerText) ? existing : nonExisting;

        btn.addEventListener("click", (ev) => {
            saveCRN(ev.target.closest('tr'));
        });
        
        dataCell.prepend(btn);
    }
}

function saveCRN(row)
{
    const cols = row.getElementsByTagName('td');
    const crn = cols[0].innerText;
    const code = cols[1].innerText;
    const title = cols[2].innerText;

    chrome.storage.local.get({savedClasses: []}, function(result) {
        var savedClasses = result.savedClasses;

        if(savedClasses.length >= 10)
        {
            window.alert('You cannot add more than 10 classes!');
            return;
        }

        if(checkExistance(savedClasses, crn)){
            window.alert('You already saved this class...');
            return;
        }
        savedClasses.push({Crn: crn, Code: code, Title: title});

        chrome.storage.local.set({savedClasses: savedClasses}, function() {
            const button = row.getElementsByClassName('scheduler_btn')[0];
            button.innerHTML = existing;
        });
    });
}

function checkExistance(array, crn) {
    if(!array) return false;

    for(var index = 0; index < array.length; index++){
        if(array[index].Crn === crn)
        {
            return true;
        }
    }
    return false;
}