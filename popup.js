let interval;
let timeLeft;
let maxTime;

let t_second;
let t_minute;
let t_hour;
let t_day;
let t_month;
let t_year;

const fmtTime = function(time) {
  let s_time;
  if (time < 10 && time >= 0) {
    s_time = "0" + time;
  } else if (time >= 10) {
    return `${time}`;
  } 
  return s_time;
}

const timeSubtract = function(cal_time) {
  let tt_second;
  let tt_minute;
  let tt_hour;
  let tt_day;
  let tt_month;

  let current_time = new Date();
  let borrow = 0;
  tt_second = cal_time.getSeconds() - current_time.getSeconds();
  if (tt_second < 0) {
    borrow = 1;
    tt_second += 60;
  }
  t_second = fmtTime(tt_second);
  tt_minute = cal_time.getMinutes() - current_time.getMinutes() - borrow;
  if(tt_minute < 0) {
    borrow = 1;
    tt_minute += 60;
  } else {
    borrow = 0;
  }
  t_minute = fmtTime(tt_minute);
  tt_hour = cal_time.getHours() - current_time.getHours() - borrow;
  if(tt_hour < 0) {
    borrow = 1;
    tt_hour += 24;
  } else {
    borrow = 0;
  }
  t_hour = fmtTime(tt_hour);
  tt_day = cal_time.getDate() - current_time.getDate() - borrow;
  if(tt_day < 0) {
    borrow = 1;
    switch(current_time.getMonth() + 1)
    {
    case 1:
    case 3:
    case 5:
    case 7:
    case 8:
    case 10:
    case 12:
      tt_day += 31;
      break;
    case 4:
    case 6:
    case 9:
    case 11:
      tt_day += 30;
      break;
    default:
      if(cal_time.getFullYear()%4==0 && cal_time.getFullYear()&100!=0
                                     || cal_time.getFullYear()%400==0) {
        tt_day += 29;
      } else {
        tt_day += 28;
      }
    }
  } else {
    borrow = 0;
  }
  t_day = fmtTime(tt_day);
  tt_month = cal_time.getMonth() - current_time.getMonth() - borrow;
  if (tt_month < 0) {
    borrow = 1;
    tt_month += 12;
  } else {
    borrow = 0;
  }
  t_month = fmtTime(tt_month);
  t_year = cal_time.getFullYear() - current_time.getFullYear() - borrow;
}

const displayStatus = function() { //function to handle the display of time and buttons
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const status = document.getElementById("status");
    const timeRem = document.getElementById("timeRem");
    const startButton = document.getElementById('start');
    const finishButton = document.getElementById('finish');
    const cancelButton = document.getElementById('cancel');
    const checkBox = document.getElementById('capImmediate');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    //CODE TO BLOCK CAPTURE ON YOUTUBE, DO NOT DELETE
    // if(tabs[0].url.toLowerCase().includes("youtube")) {
    //   status.innerHTML = "Capture is disabled on this site due to copyright";
    // } else {
      chrome.runtime.sendMessage({currentTab: tabs[0].id}, (response) => {
        if(response) {
          chrome.storage.sync.get({
            maxTime: 1200000,
          }, (options) => {
            if(options.maxTime > 1200000) {
              chrome.storage.sync.set({
                maxTime: 1200000
              });
              options.maxTime = 1200000;
            }
            if (response <= Date.now()) {
              timeLeft = options.maxTime - (Date.now() - response);
              status.innerHTML = "Tab is currently being captured";
              timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
              checkBox.style.display = "none";
              dateInput.style.display = "none";
              timeInput.style.display = "none";
              interval = setInterval(() => {
                timeLeft = timeLeft - 1000;
                timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
              }, 1000);
            } else {
              let capTime = new Date(parseInt(response,10));
              checkBox.style.display = "none";
              dateInput.style.display = "none";
              timeInput.style.display = "none";
              status.innerHTML = "Tab will be captured at "
                                  + capTime.getFullYear() + "-"
                                  + fmtTime((capTime.getMonth() + 1)) + "-"
                                  + fmtTime(capTime.getDate()) + " "
                                  + fmtTime(capTime.getHours()) + ":"
                                  + fmtTime(capTime.getMinutes()) + ":"
                                  + fmtTime(capTime.getSeconds());
              timeSubtract(capTime);
              if (t_year >= 0) {
                timeRem.innerHTML = t_year + "-" + t_month + "-" + t_day + " "
                                  + t_hour + ":" + t_minute + ":" + t_second + " remaining";
              }
              interval = setInterval(() => {
                timeSubtract(capTime);
                if (t_year >= 0) {
                  timeRem.innerHTML = t_year + "-" + t_month + "-" + t_day + " "
                                      + t_hour + ":" + t_minute + ":" + t_second + " remaining";
                } else {
                  clearInterval(interval);
                  timeLeft = options.maxTime - (Date.now() - response) - 1000;
                  status.innerHTML = "Tab is currently being captured";
                  timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
                  checkBox.style.display = "none";
                  dateInput.style.display = "none";
                  timeInput.style.display = "none";
                  interval = setInterval(() => {
                    timeLeft = timeLeft - 1000;
                    timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
                  }, 1000);
                }
              }, 1000);
            }
          });
          finishButton.style.display = "block";
          cancelButton.style.display = "block";
        } else {
          startButton.style.display = "block";
          checkBox.style.display = "block";
          dateInput.style.display = "block";
          timeInput.style.display = "block";
        }
      });
      //console.log("send message:" + {currentTab: tabs[0].id});
    // }
  });
}

const parseTime = function(time) { //function to display time remaining or time elapsed
  let minutes = Math.floor((time/1000)/60);
  let seconds = Math.floor((time/1000) % 60);
  if (minutes < 10 && minutes >= 0) {
    minutes = '0' + minutes;
  } else if (minutes < 0) {
    minutes = '00';
  }
  if (seconds < 10 && seconds >= 0) {
    seconds = '0' + seconds;
  } else if (seconds < 0) {
    seconds = '00';
  }
  return `${minutes}:${seconds}`
}

//manipulation of the displayed buttons upon message from background
chrome.runtime.onMessage.addListener((request, sender) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const status = document.getElementById("status");
    const timeRem = document.getElementById("timeRem");
    const buttons = document.getElementById("buttons");
    const startButton = document.getElementById('start');
    const finishButton = document.getElementById('finish');
    const cancelButton = document.getElementById('cancel');
    const checkBox = document.getElementById('capImmediate');
    const dateInput = document.getElementById("date");
    const timeInput = document.getElementById("time");
    if(request.captureStarted && request.captureStarted === tabs[0].id) {
      chrome.storage.sync.get({
        maxTime: 1200000,
      }, (options) => {
        if(options.maxTime > 1200000) {
          chrome.storage.sync.set({
            maxTime: 1200000
          });
          maxTime = 1200000;
        } else {
          maxTime = options.maxTime;
        }
        if (request.startTime <= Date.now()) {
          timeLeft = maxTime;
          status.innerHTML = "Tab is currently being captured";
          timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
          interval = setInterval(() => {
            timeLeft = timeLeft - 1000;
            timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
          }, 1000);
          finishButton.style.display = "block";
          cancelButton.style.display = "block";
          startButton.style.display = "none";
          checkBox.style.display = "none";
          dateInput.style.display = "none";
          timeInput.style.display = "none";
        } else {
          let captureTime = new Date(parseInt(request.startTime,10));
          status.innerHTML = "Tab will be captured at "
                            + captureTime.getFullYear() + "-"
                            + fmtTime((captureTime.getMonth() + 1)) + "-"
                            + fmtTime(captureTime.getDate()) + " "
                            + fmtTime(captureTime.getHours()) + ":"
                            + fmtTime(captureTime.getMinutes()) + ":"
                            + fmtTime(captureTime.getSeconds());
          timeSubtract(captureTime);
          if (t_year >= 0) {
            timeRem.innerHTML = t_year + "-" + t_month + "-" + t_day + " "
                              + t_hour + ":" + t_minute + ":" + t_second + " remaining";
          }
          finishButton.style.display = "none";
          cancelButton.style.display = "block";
          startButton.style.display = "none";
          checkBox.style.display = "none";
          dateInput.style.display = "none";
          timeInput.style.display = "none";
          interval = setInterval(() => {
            timeSubtract(captureTime);
            if (t_year >= 0) {
              timeRem.innerHTML = t_year + "-" + t_month + "-" + t_day + " "
                                + t_hour + ":" + t_minute + ":" + t_second + " remaining";
            } else {
              clearInterval(interval);
              timeLeft = maxTime - 1000;
              timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
              finishButton.style.display = "none";
              cancelButton.style.display = "block";
              startButton.style.display = "none";
              checkBox.style.display = "none";
              dateInput.style.display = "none";
              timeInput.style.display = "none";
              interval = setInterval(() => {
                timeLeft = timeLeft - 1000;
                timeRem.innerHTML = `${parseTime(timeLeft)} remaining`;
              }, 1000);
            }
          }, 1000);
        }
      });
    } else if(request.captureStopped && request.captureStopped === tabs[0].id) {
      status.innerHTML = "";
      finishButton.style.display = "none";
      cancelButton.style.display = "none";
      startButton.style.display = "block";
      checkBox.style.display = "block";
      dateInput.style.display = "block";
      timeInput.style.display = "block";
      timeRem.innerHTML = "";
      clearInterval(interval);
    }
  });
});


//initial display for popup menu when opened
document.addEventListener('DOMContentLoaded', function() {
  displayStatus();
  const startKey = document.getElementById("startKey");
  const endKey = document.getElementById("endKey");
  const startButton = document.getElementById('start');
  const finishButton = document.getElementById('finish');
  const cancelButton = document.getElementById('cancel');
  const checkBox = document.getElementById('capImmediate');
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");

  checkBox.onclick = () => {
    let timeInput = document.getElementById("time");
    if (checkBox.checked === true) {
      dateInput.disabled = false;
      timeInput.disabled = false;
    } else {
      dateInput.disabled = true;
      timeInput.disabled = true;
    }
  }
  startButton.onclick = () => {
    let date_set = document.getElementById("date").value;
    let dateParts = date_set.split("-");
    let time_set = document.getElementById("time").value;
    let timeParts = time_set.split(":");
    let captureTime = new Date(
                        parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]),
                        parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);
    if (checkBox.checked === true) {
      if(captureTime.getTime() < Date.now()){
        alert('The setting of capture time must be later than current time!');
      } else {
        chrome.runtime.sendMessage({captureStatus: "startCapture", time: captureTime.getTime()});
        checkBox.style.display = "none";
        dateInput.style.display = "none";
        timeInput.style.display = "none";
      }
    } else {
        chrome.runtime.sendMessage({captureStatus: "startCapture", time: Date.now()});
        checkBox.style.display = "none";
        dateInput.style.display = "none";
        timeInput.style.display = "none";
    }
  };
  finishButton.onclick = () => {chrome.runtime.sendMessage({captureStatus: "stopCapture", time: Date.now()})};
  cancelButton.onclick = () => {
    chrome.runtime.sendMessage({captureStatus: "cancelCapture", time: Date.now()});
    //console.log("send cancel capture");
    checkBox.style.display = "block";
    dateInput.style.display = "block";
    timeInput.style.display = "block";
    checkBox.disabled = false;
    if (checkBox.checked === true) {
      dateInput.disabled = false;
      timeInput.disabled = false;
    } else {
      dateInput.disabled = true;
      timeInput.disabled = true;
    }
  };
  chrome.runtime.getPlatformInfo((info) => {
    if(info.os === "mac") {
      startKey.innerHTML = "Command + Shift + U to start capture on current tab";
      endKey.innerHTML = "Command + Shift + X to stop capture on current tab";
    } else {
      startKey.innerHTML = "Ctrl + Shift + S to start capture on current tab";
      endKey.innerHTML = "Ctrl + Shift + X to stop capture on current tab";
    }
  })
  const options = document.getElementById("options");
  options.onclick = () => {chrome.runtime.openOptionsPage()};
  const git = document.getElementById("GitHub");
  git.onclick = () => {chrome.tabs.create({url: "https://github.com/chou-o-ning/Chrome-Audio-Capturer-NingMod"})};

});
