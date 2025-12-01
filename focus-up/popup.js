document.addEventListener("DOMContentLoaded", () => {

    const themeSelect = document.getElementById("theme-select")
    const container = document.querySelector(".container")
  
  
    const savedTheme = localStorage.getItem("selectedTheme") || "samurai"
    container.className = `container theme-${savedTheme}`
    themeSelect.value = savedTheme
  

    themeSelect.addEventListener("change", (e) => {
      const selectedTheme = e.target.value
      container.className = `container theme-${selectedTheme}`
      localStorage.setItem("selectedTheme", selectedTheme)
    })
  

    const tabButtons = document.querySelectorAll(".tab-btn")
    const tabContents = document.querySelectorAll(".tab-content")
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const tabName = button.getAttribute("data-tab")
  

        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))
  

        button.classList.add("active")
        document.getElementById(tabName).classList.add("active")
      })
    })
  
const minutesDisplay = document.getElementById("minutes");
const secondsDisplay = document.getElementById("seconds");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resetBtn = document.getElementById("reset-btn");
const focusTimeInput = document.getElementById("focus-time");
const breakTimeInput = document.getElementById("break-time");
let sessionsCompleted = 0;
let dailyFocusMinutes = 0;
const focusState = document.getElementById("focus-state");
const sessionsCompletedDisplay = document.getElementById("sessions-completed");
const dailyFocusDisplay = document.getElementById("daily-focus");

let timer;
let timerState = {
    isRunning: false,
    isPaused: false,
    isBreak: false,
    endTime: null,
    remainingTime: 25 * 60,
    focusDuration: 25 * 60,
    breakDuration: 5 * 60
};


chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState) {
        timerState = result.timerState;
        updateTimerFromState();
    }
});

function updateTimerFromState() {
    if (timerState.isRunning && !timerState.isPaused) {
        const now = Date.now();
        if (timerState.endTime > now) {
            timerState.remainingTime = Math.ceil((timerState.endTime - now) / 1000);
            updateTimerDisplay();
            startTimer(false);
        } else {
            timerComplete();
        }
    }
    updateTimerDisplay();
    focusState.textContent = timerState.isBreak ? "On Break" : 
                            timerState.isRunning ? "Focusing" : "Ready to Focus";
}

function saveTimerState() {
    chrome.storage.local.set({ timerState });
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerState.remainingTime / 60);
    const seconds = timerState.remainingTime % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, "0");
    secondsDisplay.textContent = seconds.toString().padStart(2, "0");
}

function startTimer(isNewTimer = true) {
    if (timerState.isRunning && !timerState.isPaused) return;
    
    if (isNewTimer) {
        const duration = timerState.isBreak ? timerState.breakDuration : timerState.focusDuration;
        timerState.remainingTime = duration;
        timerState.endTime = Date.now() + (duration * 1000);
    }

    timerState.isRunning = true;
    timerState.isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    focusState.textContent = timerState.isBreak ? "On Break" : "Focusing";

    saveTimerState();

    timer = setInterval(() => {
        const now = Date.now();
        if (now >= timerState.endTime) {
            timerComplete();
            return;
        }
        timerState.remainingTime = Math.ceil((timerState.endTime - now) / 1000);
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    timerState.isPaused = true;
    timerState.remainingTime = Math.ceil((timerState.endTime - Date.now()) / 1000);
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    saveTimerState();
}

function resetTimer() {
    clearInterval(timer);
    timerState = {
        isRunning: false,
        isPaused: false,
        isBreak: false,
        endTime: null,
        remainingTime: parseInt(focusTimeInput.value) * 60,
        focusDuration: parseInt(focusTimeInput.value) * 60,
        breakDuration: parseInt(breakTimeInput.value) * 60
    };
    focusState.textContent = "Ready to Focus";
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    updateTimerDisplay();
    saveTimerState();
}

function timerComplete() {
    clearInterval(timer);
    let title, message;
    
    if (!timerState.isBreak) {
        sessionsCompleted++;
        dailyFocusMinutes += parseInt(focusTimeInput.value);
        sessionsCompletedDisplay.textContent = sessionsCompleted;
        dailyFocusDisplay.textContent = dailyFocusMinutes;
        
        title = "Focus Session Complete!";
        message = `Great work! Time for a ${breakTimeInput.value}-minute break.`;
        timerState.isBreak = true;
        timerState.remainingTime = parseInt(breakTimeInput.value) * 60;
    } else {
        title = "Break Time Over!";
        message = "Ready to focus again?";
        timerState.isBreak = false;
        timerState.remainingTime = parseInt(focusTimeInput.value) * 60;
    }

    timerState.isRunning = false;
    timerState.endTime = null;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    
    showModal(title, message);
    saveTimerState();
    updateTimerDisplay();


    const timerSound = document.getElementById("timerComplete");
    timerSound.play();

    if (Notification.permission === "granted") {
        new Notification("Samurai Focus", {
            body: message,
            icon: "/path/to/your/icon.png"
        });
    }
}


startBtn.addEventListener("click", () => startTimer(true));
pauseBtn.addEventListener("click", pauseTimer);
resetBtn.addEventListener("click", resetTimer);

focusTimeInput.addEventListener("change", () => {
    if (!timerState.isRunning) {
        timerState.focusDuration = parseInt(focusTimeInput.value) * 60;
        if (!timerState.isBreak) {
            timerState.remainingTime = timerState.focusDuration;
            updateTimerDisplay();
            saveTimerState();
        }
    }
});

breakTimeInput.addEventListener("change", () => {
    timerState.breakDuration = parseInt(breakTimeInput.value) * 60;
    if (timerState.isBreak && !timerState.isRunning) {
        timerState.remainingTime = timerState.breakDuration;
        updateTimerDisplay();
        saveTimerState();
    }
});


const taskInput = document.getElementById("task-input")
const taskDate = document.getElementById("task-date")
const addTaskBtn = document.getElementById("add-task-btn")
const taskList = document.getElementById("task-list")


const today = new Date()
taskDate.valueAsDate = today


chrome.storage.local.get(['tasks'], (result) => {
    if (result.tasks) {
        result.tasks.forEach(task => {
            createTaskElement(task.text, task.dueDate, task.completed);
        });
    }
});

function saveTasks() {
    const tasks = [];
    taskList.querySelectorAll('.task-item').forEach(taskItem => {
        tasks.push({
            text: taskItem.querySelector('.task-title').textContent,
            dueDate: taskItem.querySelector('.task-date').textContent.replace('Due: ', ''),
            completed: taskItem.classList.contains('completed')
        });
    });
    chrome.storage.local.set({ tasks });
}

function createTaskElement(taskText, dueDate, completed = false) {
    const taskItem = document.createElement("div")
    taskItem.className = "task-item"
    if (completed) taskItem.classList.add('completed')
    
    taskItem.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${completed ? 'checked' : ''}>
        <div class="task-content">
            <div class="task-title">${taskText}</div>
            <div class="task-date">Due: ${dueDate}</div>
        </div>
        <button class="task-delete">×</button>
    `

    const checkbox = taskItem.querySelector(".task-checkbox")
    checkbox.addEventListener("change", () => {
        taskItem.classList.toggle("completed", checkbox.checked)
        saveTasks()
    })

    const deleteBtn = taskItem.querySelector(".task-delete")
    deleteBtn.addEventListener("click", () => {
        taskItem.remove()
        saveTasks()
    })

    taskList.appendChild(taskItem)
}

function addTask() {
    const taskText = taskInput.value.trim()
    const dueDate = taskDate.value

    if (taskText === "") return

    createTaskElement(taskText, formatDate(dueDate))
    saveTasks()
    taskInput.value = ""
}

function formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

addTaskBtn.addEventListener("click", addTask)
taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask()
})
      
   
        const quoteText = document.getElementById("quote-text")
        const quoteAuthor = document.getElementById("quote-author")
        const newQuoteBtn = document.getElementById("new-quote-btn")
      
        const quotes = [
          {
            text: "The way of the warrior is a resolute acceptance of death.",
            author: "Miyamoto Musashi",
          },
          {
            text: "You must understand that there is more than one path to the top of the mountain.",
            author: "Miyamoto Musashi",
          },
          {
            text: "Get beyond love and grief; exist for the good of man.",
            author: "Miyamoto Musashi",
          },
          {
            text: "Today is victory over yourself of yesterday.",
            author: "Miyamoto Musashi",
          },
          {
            text: "Step by step walk the thousand-mile road.",
            author: "Miyamoto Musashi",
          },
          {
            text: "The ultimate aim of martial arts is not having to use them.",
            author: "Gichin Funakoshi",
          },
          {
            text: "In the midst of chaos, there is also opportunity.",
            author: "Sun Tzu",
          },
          {
            text: "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water.",
            author: "Zen Proverb",
          },
          {
            text: "The bamboo that bends is stronger than the oak that resists.",
            author: "Japanese Proverb",
          },
          {
            text: "Fall seven times, stand up eight.",
            author: "Japanese Proverb",
          },
          {
            text: "Vision without action is a daydream. Action without vision is a nightmare.",
            author: "Japanese Proverb",
          },
          {
            text: "When you bow deeply to the universe, it bows back.",
            author: "Morihei Ueshiba",
          },
          {
            text: "Patience is the virtue of the strong.",
            author: "Japanese Proverb",
          },
          {
            text: "The day you decide to do it is your lucky day.",
            author: "Japanese Proverb",
          },
          {
            text: "Beginning is easy, continuing is hard.",
            author: "Japanese Proverb",
          },
          {
            text: "No road is long with good company.",
            author: "Japanese Proverb",
          },
          {
            text: "Time spent laughing is time spent with the gods.",
            author: "Japanese Proverb",
          },
          {
            text: "Better than a thousand days of diligent study is one day with a great teacher.",
            author: "Japanese Proverb",
          },
        ]
      
        function displayRandomQuote() {
          const randomIndex = Math.floor(Math.random() * quotes.length)
          const quote = quotes[randomIndex]
          quoteText.textContent = quote.text
          quoteAuthor.textContent = `- ${quote.author}`
        }
      
        newQuoteBtn.addEventListener("click", displayRandomQuote)
        displayRandomQuote() 

    let audioContext;
    const soundBuffers = {};
    let currentSource = null;

    const sounds = {
        rain: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1b0809f7aa.mp3",
        bamboo: "https://cdn.pixabay.com/download/audio/2022/03/24/audio_d1d07f4427.mp3",
        river: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_88447e769f.mp3",
        wind: "https://cdn.pixabay.com/download/audio/2021/08/09/audio_c4e85cb560.mp3"
    };

    async function initAudioContext() {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        for (const [type, url] of Object.entries(sounds)) {
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                soundBuffers[type] = await audioContext.decodeAudioData(arrayBuffer);
            } catch (error) {
                console.error(`Error loading sound ${type}:`, error);
            }
        }
    }

    function playSound(type) {
        if (!audioContext) {
            initAudioContext();
        }

        if (currentSource) {
            currentSource.stop();
            currentSource = null;
        }

        const buffer = soundBuffers[type];
        if (buffer) {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            source.connect(audioContext.destination);
            source.start();
            currentSource = source;
        }
    }

    function stopSound() {
        if (currentSource) {
            currentSource.stop();
            currentSource = null;
        }
    }

    const soundItems = document.querySelectorAll(".sound-item");
    soundItems.forEach(item => {
        const playBtn = item.querySelector(".play-btn");
        const soundType = item.getAttribute("data-sound");

        playBtn.addEventListener("click", async () => {
            if (!audioContext) {
                await initAudioContext();
            }

            if (playBtn.textContent === "Play") {
               
                soundItems.forEach(si => {
                    const btn = si.querySelector(".play-btn");
                    btn.textContent = "Play";
                });

                playSound(soundType);
                playBtn.textContent = "Stop";
            } else {
                stopSound();
                playBtn.textContent = "Play";
            }
        });
    });

    
    updateTimerDisplay();

});