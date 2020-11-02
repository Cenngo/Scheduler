let dt;

chrome.alarms.onAlarm.addListener(function(e) {
  if(e.name != 'scheduler_interval') return;

  refresh(e);
});
chrome.alarms.onAlarm.addListener(function(e) {
  if(e.name != 'scheduler_final') return;

  performAutoFill(e);
});

function startExec() {

  chrome.storage.local.get('addDropDate', function(result) {
    const addDropDate = new Date(result.addDropDate);
    dt = addDropDate;

    if(!addDropDate.getTime()) {
      alert('Add/Drop Time isn\'t Spesified!');
      return;
    }
    if(addDropDate.getTime() < Date.now()){
      alert('Set Time Already Passed!');
      return;
    }

    chrome.alarms.create('scheduler_final', {when: addDropDate.getTime()});
    chrome.alarms.create('scheduler_interval', {delayInMinutes: 4.5 });

    setUiState(true);
  });
}

function stopExec() {
  chrome.alarms.clearAll(function(wasCleared) {
    console.log('All Alarms Cleared');
    setUiState(false);
  });
}

function refresh(alarm) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    chrome.tabs.reload(currentTab.id);
    if(dt.getTime() > Date.now()) chrome.alarms.create('scheduler_interval', {delayInMinutes: 1 });
  });
}

function performAutoFill(alarm) {
  chrome.webNavigation.onCompleted.addListener(autoFillClasses, {url: [
    {urlMatches: 'https://web.itu.edu.tr/durgunor/crn.html'}, 
    {urlMatches: 'http://ssb.sis.itu.edu.tr:9000/pls/PROD/bwskfreg.P_AltPin'},
    {urlMatches: 'http://ssb.sis.itu.edu.tr:9000/pls/PROD/twbkwbis.P_OpenDoc'}]
  });
  
  //Change With the actual navigation action

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const tabId = tabs[0].id;
    if(tabs[0].url == 'https://web.itu.edu.tr/durgunor/crn.html') {
      chrome.tabs.reload(tabId);
    } 
    else {
      chrome.tabs.sendMessage(tabId, {name: 'navigateToPage'}, function(response) {
        
      });
    }
  });
  
  // ********************* 

  chrome.alarms.clear('scheduler_interval', function(wasCleared) {
    if(wasCleared) console.log('Alarms Successully Cleared!');
  });
  setUiState(false);
}

function autoFillClasses() {
  chrome.webNavigation.onCompleted.removeListener(autoFillClasses);

  chrome.storage.local.get(['autoFillDelay', 'savedClasses'], function(result) {
    const delay = result.autoFillDelay;
    const classes = result.savedClasses.map(x => x.Crn);

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const tabId = tabs[0].id;
      console.log(tabs[0]);
      setTimeout(function() {
        chrome.tabs.sendMessage(tabId, {name: 'scheduler_fillClasses', classes: classes, isManual: false}, function(response) {
          console.log(`Content Script Transaction >> Status : ${response.status}, Url : ${response.url}`);
        });
      }, delay || 500);
    });
  });
}

function setUiState (state) {
  changeBadgeState(state);

  var views = chrome.extension.getViews({ type: "popup" });
  if(views.length > 0) chrome.runtime.sendMessage({name: 'autoRefreshProcess', state: state}, function(response) {
  });
}

function changeBadgeState(isActive) {
  if(isActive) {
      chrome.browserAction.setBadgeBackgroundColor({color: '#00BB00'});
      chrome.browserAction.setBadgeText({text: 'active'});
  }
  else {
      chrome.browserAction.setBadgeText({text: ''});
  }
} 