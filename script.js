// DOM elements
const workMinutesInput = document.getElementById('work-minutes');
const workSecondsInput = document.getElementById('work-seconds');
const breakMinutesInput = document.getElementById('break-minutes');
const breakSecondsInput = document.getElementById('break-seconds');
const startTimerButton = document.getElementById('start-timer');
const timeRemainingElement = document.getElementById('time-remaining');
const timerStatusElement = document.getElementById('timer-status');
const workTimerCompleteElement = document.getElementById('work-timer-complete');
const breakTimerCompleteElement = document.getElementById('break-timer-complete');
const workDoneButton = document.getElementById('work-done');
const breakDoneButton = document.getElementById('break-done');
const workTimeRatingInput = document.getElementById('work-time-rating');
const workRatingValueDisplay = document.getElementById('work-rating-value');
const breakTimeRatingInput = document.getElementById('break-time-rating');
const breakRatingValueDisplay = document.getElementById('break-rating-value');
const workFeedbackToggle = document.getElementById('work-feedback-toggle');
const breakFeedbackToggle = document.getElementById('break-feedback-toggle');
const workFeedbackForm = document.getElementById('work-feedback-form');
const breakFeedbackForm = document.getElementById('break-feedback-form');
const savedInstancesList = document.getElementById('saved-instances-list');
const instanceNameInput = document.getElementById('instance-name');
const saveInstanceButton = document.getElementById('save-instance');
const noInstancesMessage = document.getElementById('no-instances-message');

// Timer variables
let timerInterval;
let startTime;
let totalSeconds = 0;
let remainingSeconds = 0;
let isWorkTimer = true;
let breakTotalSeconds = 0;
let includeFeedback = {
    work: false,
    break: false
};
let sessionData = {
    work: {
        startDateTime: '',
        elapsedTime: '',
        feedback: null
    },
    break: {
        startDateTime: '',
        elapsedTime: '',
        feedback: null
    }
};

// Format time as MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Start the work timer
function startTimer() {
    // Get input values for work timer
    const workMinutes = parseInt(workMinutesInput.value) || 0;
    const workSeconds = parseInt(workSecondsInput.value) || 0;
    
    // Get input values for break timer
    const breakMinutes = parseInt(breakMinutesInput.value) || 0;
    const breakSeconds = parseInt(breakSecondsInput.value) || 0;
    
    // Validate input
    if (workMinutes === 0 && workSeconds === 0) {
        timerStatusElement.textContent = 'Please set a work time greater than 0';
        return;
    }
    
    if (breakMinutes === 0 && breakSeconds === 0) {
        timerStatusElement.textContent = 'Please set a break time greater than 0';
        return;
    }
    
    // Calculate total seconds for work and break
    totalSeconds = (workMinutes * 60) + workSeconds;
    breakTotalSeconds = (breakMinutes * 60) + breakSeconds;
    remainingSeconds = totalSeconds;
    
    // Disable inputs and start button
    disableInputs();
    
    // Update status
    timerStatusElement.textContent = 'Work timer running...';
    
// Reset session data and record start time for work
isWorkTimer = true;
startTime = new Date();
includeFeedback = {
    work: false,
    break: false
};
sessionData = {
    work: {
        startDateTime: startTime.toISOString(),
        elapsedTime: '',
        feedback: null
    },
    break: {
        startDateTime: '',
        elapsedTime: '',
        feedback: null
    }
};
    
    // Update timer display
    timeRemainingElement.textContent = formatTime(remainingSeconds);
    
    // Start interval
    timerInterval = setInterval(updateTimer, 1000);
}

// Update the timer
function updateTimer() {
    remainingSeconds--;
    
    // Update display
    timeRemainingElement.textContent = formatTime(remainingSeconds);
    
    // Check if timer is complete
    if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        timerComplete();
    }
}

// Handle timer completion
function timerComplete() {
    if (isWorkTimer) {
        // Work timer complete
        timerStatusElement.textContent = 'Work timer complete!';
        
        // Show work completion section
        workTimerCompleteElement.classList.remove('hidden');
        
        // Play alert sound and show browser notification
        alert('Work timer complete!');
    } else {
        // Break timer complete
        timerStatusElement.textContent = 'Break timer complete!';
        
        // Show break completion section
        breakTimerCompleteElement.classList.remove('hidden');
        
        // Play alert sound and show browser notification
        alert('Break timer complete!');
    }
}

// Start the break timer
function startBreakTimer() {
    // Hide work completion section
    workTimerCompleteElement.classList.add('hidden');
    
    // Set remaining seconds to break duration
    remainingSeconds = breakTotalSeconds;
    
    // Update status
    timerStatusElement.textContent = 'Break timer running...';
    
    // Record start time for break
    isWorkTimer = false;
    startTime = new Date();
    sessionData.break.startDateTime = startTime.toISOString();
    
    // Update timer display
    timeRemainingElement.textContent = formatTime(remainingSeconds);
    
    // Start interval
    timerInterval = setInterval(updateTimer, 1000);
}

// Disable all inputs
function disableInputs() {
    workMinutesInput.disabled = true;
    workSecondsInput.disabled = true;
    breakMinutesInput.disabled = true;
    breakSecondsInput.disabled = true;
    startTimerButton.disabled = true;
}

// Enable all inputs
function enableInputs() {
    workMinutesInput.disabled = false;
    workSecondsInput.disabled = false;
    breakMinutesInput.disabled = false;
    breakSecondsInput.disabled = false;
    startTimerButton.disabled = false;
}

// Reset the timer
function resetTimer() {
    // Clear interval
    clearInterval(timerInterval);
    
    // Enable inputs
    enableInputs();
    
    // Reset display
    timeRemainingElement.textContent = '00:00';
    timerStatusElement.textContent = '';
    
    // Hide completion sections
    workTimerCompleteElement.classList.add('hidden');
    breakTimerCompleteElement.classList.add('hidden');
    
    // Reset feedback forms
    resetFeedbackForms();
}

// Reset feedback forms
function resetFeedbackForms() {
    // Reset work feedback
    workTimeRatingInput.value = 5;
    workRatingValueDisplay.textContent = '5';
    document.querySelectorAll('input[name="flow-state"]').forEach(radio => {
        radio.checked = false;
    });
    
    // Reset break feedback
    breakTimeRatingInput.value = 5;
    breakRatingValueDisplay.textContent = '5';
    
    // Reset feedback toggles
    workFeedbackToggle.checked = false;
    breakFeedbackToggle.checked = false;
    
    // Collapse feedback forms
    workFeedbackForm.classList.add('collapsed');
    breakFeedbackForm.classList.add('collapsed');
    
    // Reset feedback inclusion
    includeFeedback.work = false;
    includeFeedback.break = false;
    
    // Reset session data
    sessionData.work.feedback = null;
    sessionData.break.feedback = null;
}

// Handle work done button click
function handleWorkDone() {
    // Calculate elapsed time for work
    const endTime = new Date();
    const elapsedMilliseconds = endTime - new Date(sessionData.work.startDateTime);
    
    // Format elapsed time
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    sessionData.work.elapsedTime = formatTime(elapsedSeconds);
    
    // Include feedback if toggle is checked
    if (includeFeedback.work) {
        sessionData.work.feedback = {
            timeRating: parseInt(workTimeRatingInput.value),
            flowState: getFlowState()
        };
    } else {
        sessionData.work.feedback = null;
    }
    
    // Start the break timer
    startBreakTimer();
}

// Get the selected flow state
function getFlowState() {
    const flowStateRadios = document.querySelectorAll('input[name="flow-state"]');
    for (const radio of flowStateRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return null;
}

// Handle break done button click
function handleBreakDone() {
    // Calculate elapsed time for break
    const endTime = new Date();
    const elapsedMilliseconds = endTime - new Date(sessionData.break.startDateTime);
    
    // Format elapsed time
    const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
    sessionData.break.elapsedTime = formatTime(elapsedSeconds);
    
    // Include feedback if toggle is checked
    if (includeFeedback.break) {
        sessionData.break.feedback = {
            refreshRating: parseInt(breakTimeRatingInput.value)
        };
    } else {
        sessionData.break.feedback = null;
    }
    
    // Save data to JSON file
    saveSessionData();
    
    // Reset timer
    resetTimer();
}

// Save session data to JSON file in the data folder
function saveSessionData() {
    // Show saving status
    timerStatusElement.textContent = 'Saving session data...';
    
    // Send data to server
    fetch('/api/save-timer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            timerStatusElement.textContent = `Session data saved for week: ${data.weekId}`;
        } else {
            timerStatusElement.textContent = 'Error saving session data';
            console.error('Error:', data.message);
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error saving session data';
        console.error('Error:', error);
    });
}

// Toggle work feedback form
workFeedbackToggle.addEventListener('change', function() {
    includeFeedback.work = this.checked;
    if (this.checked) {
        workFeedbackForm.classList.remove('collapsed');
    } else {
        workFeedbackForm.classList.add('collapsed');
    }
});

// Toggle break feedback form
breakFeedbackToggle.addEventListener('change', function() {
    includeFeedback.break = this.checked;
    if (this.checked) {
        breakFeedbackForm.classList.remove('collapsed');
    } else {
        breakFeedbackForm.classList.add('collapsed');
    }
});

// Update work rating display when slider changes
workTimeRatingInput.addEventListener('input', function() {
    workRatingValueDisplay.textContent = this.value;
    // Auto-check the feedback toggle if user interacts with the rating
    if (!workFeedbackToggle.checked) {
        workFeedbackToggle.checked = true;
        includeFeedback.work = true;
        workFeedbackForm.classList.remove('collapsed');
    }
});

// Update break rating display when slider changes
breakTimeRatingInput.addEventListener('input', function() {
    breakRatingValueDisplay.textContent = this.value;
    // Auto-check the feedback toggle if user interacts with the rating
    if (!breakFeedbackToggle.checked) {
        breakFeedbackToggle.checked = true;
        includeFeedback.break = true;
        breakFeedbackForm.classList.remove('collapsed');
    }
});

// Handle flow state selection
document.querySelectorAll('input[name="flow-state"]').forEach(radio => {
    radio.addEventListener('change', function() {
        // Auto-check the feedback toggle if user interacts with flow state
        if (!workFeedbackToggle.checked) {
            workFeedbackToggle.checked = true;
            includeFeedback.work = true;
            workFeedbackForm.classList.remove('collapsed');
        }
    });
});

// Save current timer settings as a named instance
function saveInstance() {
    const name = instanceNameInput.value.trim();
    
    if (!name) {
        timerStatusElement.textContent = 'Please enter a name for the timer';
        return;
    }
    
    // Get current timer values
    const workMinutes = parseInt(workMinutesInput.value) || 0;
    const workSeconds = parseInt(workSecondsInput.value) || 0;
    const breakMinutes = parseInt(breakMinutesInput.value) || 0;
    const breakSeconds = parseInt(breakSecondsInput.value) || 0;
    
    // Validate input
    if (workMinutes === 0 && workSeconds === 0) {
        timerStatusElement.textContent = 'Please set a work time greater than 0';
        return;
    }
    
    if (breakMinutes === 0 && breakSeconds === 0) {
        timerStatusElement.textContent = 'Please set a break time greater than 0';
        return;
    }
    
    // Create instance data
    const instanceData = {
        name: name,
        workTimer: {
            minutes: workMinutes,
            seconds: workSeconds
        },
        breakTimer: {
            minutes: breakMinutes,
            seconds: breakSeconds
        }
    };
    
    // Send data to server
    timerStatusElement.textContent = 'Saving timer...';
    
    fetch('/api/save-instance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(instanceData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            timerStatusElement.textContent = 'Timer saved successfully';
            instanceNameInput.value = '';
            loadInstances(); // Refresh the instances list
        } else {
            timerStatusElement.textContent = 'Error saving timer';
            console.error('Error:', data.message);
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error saving timer';
        console.error('Error:', error);
    });
}

// Load all saved instances
function loadInstances() {
    fetch('/api/instances')
        .then(response => response.json())
        .then(data => {
            // Clear the current list
            savedInstancesList.innerHTML = '';
            
            if (data.instances && data.instances.length > 0) {
                // Hide the "no instances" message
                noInstancesMessage.style.display = 'none';
                
                // Add each instance to the list
                data.instances.forEach(instance => {
                    const instanceElement = createInstanceElement(instance);
                    savedInstancesList.appendChild(instanceElement);
                });
            } else {
                // Show the "no instances" message
                noInstancesMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error loading instances:', error);
            timerStatusElement.textContent = 'Error loading saved timers';
        });
}

// Create an HTML element for an instance
function createInstanceElement(instance) {
    const instanceElement = document.createElement('div');
    instanceElement.className = 'instance-item';
    
    const workTime = `${instance.workTimer.minutes.toString().padStart(2, '0')}:${instance.workTimer.seconds.toString().padStart(2, '0')}`;
    const breakTime = `${instance.breakTimer.minutes.toString().padStart(2, '0')}:${instance.breakTimer.seconds.toString().padStart(2, '0')}`;
    
    instanceElement.innerHTML = `
        <div class="instance-info">
            <div class="instance-name">${instance.name}</div>
            <div class="instance-times">Work: ${workTime} / Break: ${breakTime}</div>
        </div>
        <div class="instance-actions">
            <button class="load-instance">Load</button>
            <button class="delete-instance">Delete</button>
        </div>
    `;
    
    // Add event listener for load button
    const loadButton = instanceElement.querySelector('.load-instance');
    loadButton.addEventListener('click', () => loadInstance(instance));
    
    // Add event listener for delete button
    const deleteButton = instanceElement.querySelector('.delete-instance');
    deleteButton.addEventListener('click', () => deleteInstance(instance.id));
    
    return instanceElement;
}

// Load a specific instance
function loadInstance(instance) {
    // Set the timer values
    workMinutesInput.value = instance.workTimer.minutes;
    workSecondsInput.value = instance.workTimer.seconds;
    breakMinutesInput.value = instance.breakTimer.minutes;
    breakSecondsInput.value = instance.breakTimer.seconds;
    
    timerStatusElement.textContent = `Loaded timer: ${instance.name}`;
}

// Delete an instance
function deleteInstance(id) {
    fetch(`/api/instances/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadInstances(); // Refresh the instances list
            timerStatusElement.textContent = 'Timer deleted successfully';
        } else {
            timerStatusElement.textContent = 'Error deleting timer';
            console.error('Error:', data.message);
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error deleting timer';
        console.error('Error:', error);
    });
}

// Load instances when the page loads
document.addEventListener('DOMContentLoaded', loadInstances);

// Event listeners
startTimerButton.addEventListener('click', startTimer);
workDoneButton.addEventListener('click', handleWorkDone);
breakDoneButton.addEventListener('click', handleBreakDone);
saveInstanceButton.addEventListener('click', saveInstance);
