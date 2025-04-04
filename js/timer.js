// Timer Module
// Handles all timer-related functionality

// Timer variables
import alarmModule from './alarm.js';

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

// DOM elements
let workMinutesInput;
let workSecondsInput;
let breakMinutesInput;
let breakSecondsInput;
let startTimerButton;
let timeRemainingElement;
let timerStatusElement;
let workTimerCompleteElement;
let breakTimerCompleteElement;
let workDoneButton;
let breakDoneButton;
let nextTimerButton;
let workTimeRatingInput;
let workRatingValueDisplay;
let breakTimeRatingInput;
let breakRatingValueDisplay;
let workFeedbackToggle;
let breakFeedbackToggle;
let workFeedbackForm;
let breakFeedbackForm;

// Initialize timer module
export function initTimerModule(elements) {
    // Store DOM elements
    workMinutesInput = elements.workMinutesInput;
    workSecondsInput = elements.workSecondsInput;
    breakMinutesInput = elements.breakMinutesInput;
    breakSecondsInput = elements.breakSecondsInput;
    startTimerButton = elements.startTimerButton;
    timeRemainingElement = elements.timeRemainingElement;
    timerStatusElement = elements.timerStatusElement;
    workTimerCompleteElement = elements.workTimerCompleteElement;
    breakTimerCompleteElement = elements.breakTimerCompleteElement;
    workDoneButton = elements.workDoneButton;
    breakDoneButton = elements.breakDoneButton;
    nextTimerButton = elements.nextTimerButton;
    workTimeRatingInput = elements.workTimeRatingInput;
    workRatingValueDisplay = elements.workRatingValueDisplay;
    breakTimeRatingInput = elements.breakTimeRatingInput;
    breakRatingValueDisplay = elements.breakRatingValueDisplay;
    workFeedbackToggle = elements.workFeedbackToggle;
    breakFeedbackToggle = elements.breakFeedbackToggle;
    workFeedbackForm = elements.workFeedbackForm;
    breakFeedbackForm = elements.breakFeedbackForm;
    
    // Set up event listeners
    startTimerButton.addEventListener('click', startTimer);
    workDoneButton.addEventListener('click', handleWorkDone);
    breakDoneButton.addEventListener('click', handleBreakDone);
    
    // Set up feedback toggle listeners
    workFeedbackToggle.addEventListener('change', function() {
        includeFeedback.work = this.checked;
        if (this.checked) {
            workFeedbackForm.classList.remove('collapsed');
        } else {
            workFeedbackForm.classList.add('collapsed');
        }
    });
    
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
}

// Format time as MM:SS
export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Start the work timer
export function startTimer(isScheduleRunning = false) {
    // If we're running a schedule, don't allow manual timer start
    if (isScheduleRunning && !arguments[0].isTrusted) {
        timerStatusElement.textContent = 'Schedule is running, cannot start manual timer';
        return;
    }
    
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
          
        // Play alert sound
        alarmModule.play("slot");
        
        // If we're running a schedule, show the work feedback form
        // The user will need to click the "Done" button to proceed
    } else {
        // Break timer complete
        timerStatusElement.textContent = 'Break timer complete!';
        
        // Show break completion section
        breakTimerCompleteElement.classList.remove('hidden');
        
        // Play alert sound
        alarmModule.play("rooster");
        
        // If we're running a schedule, show the break feedback form and next timer button
        if (window.scheduleModule && window.scheduleModule.isRunningSchedule()) {
            // Show next timer button
            nextTimerButton.classList.remove('hidden');
            
            // User will need to click "Done" or "Next Timer" to proceed
        }
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
export function disableInputs() {
    workMinutesInput.disabled = true;
    workSecondsInput.disabled = true;
    breakMinutesInput.disabled = true;
    breakSecondsInput.disabled = true;
    startTimerButton.disabled = true;
}

// Enable all inputs
export function enableInputs() {
    workMinutesInput.disabled = false;
    workSecondsInput.disabled = false;
    breakMinutesInput.disabled = false;
    breakSecondsInput.disabled = false;
    startTimerButton.disabled = false;
}

// Reset the timer
export function resetTimer() {
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
    
    // Hide next timer button
    nextTimerButton.classList.add('hidden');
    
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
    if (window.serializationModule) {
        window.serializationModule.saveSessionData(sessionData);
    }
    
    // Reset timer
    resetTimer();
    
    // If we're running a schedule, check if it's the last timer
    if (window.scheduleModule && window.scheduleModule.isRunningSchedule()) {
        if (window.scheduleModule.isLastTimer()) {
            // Last timer in schedule completed, show schedule feedback
            window.scheduleModule.showScheduleFeedback();
        }
    }
}

// Handle next timer button click
export function handleNextTimer() {
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
    if (window.serializationModule) {
        window.serializationModule.saveSessionData(sessionData);
    }
    
    // Reset timer
    resetTimer();
    
    // Start the next timer in the schedule
    if (window.scheduleModule) {
        window.scheduleModule.startNextTimer();
    }
}

// Set timer values
export function setTimerValues(workMinutes, workSeconds, breakMinutes, breakSeconds) {
    workMinutesInput.value = workMinutes;
    workSecondsInput.value = workSeconds;
    breakMinutesInput.value = breakMinutes;
    breakSecondsInput.value = breakSeconds;
}

// Get timer values
export function getTimerValues() {
    return {
        workMinutes: parseInt(workMinutesInput.value) || 0,
        workSeconds: parseInt(workSecondsInput.value) || 0,
        breakMinutes: parseInt(breakMinutesInput.value) || 0,
        breakSeconds: parseInt(breakSecondsInput.value) || 0
    };
}

// Set timer status
export function setTimerStatus(status) {
    timerStatusElement.textContent = status;
}

// Export module
export default {
    initTimerModule,
    formatTime,
    startTimer,
    resetTimer,
    disableInputs,
    enableInputs,
    handleNextTimer,
    setTimerValues,
    getTimerValues,
    setTimerStatus
};
