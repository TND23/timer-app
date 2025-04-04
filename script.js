// Main Application Script
// Imports modules and initializes the application

// Import modules
import timerModule from './js/timer.js';
import serializationModule from './js/serialization.js';
import scheduleModule from './js/schedule.js';
import alarmModule from './js/alarm.js';
import tagModule from './js/tag.js';

// DOM elements for navigation
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.app-section');

// DOM elements for timer module
const timerElements = {
    workMinutesInput: document.getElementById('work-minutes'),
    workSecondsInput: document.getElementById('work-seconds'),
    breakMinutesInput: document.getElementById('break-minutes'),
    breakSecondsInput: document.getElementById('break-seconds'),
    startTimerButton: document.getElementById('start-timer'),
    timeRemainingElement: document.getElementById('time-remaining'),
    timerStatusElement: document.getElementById('timer-status'),
    workTimerCompleteElement: document.getElementById('work-timer-complete'),
    breakTimerCompleteElement: document.getElementById('break-timer-complete'),
    workDoneButton: document.getElementById('work-done'),
    breakDoneButton: document.getElementById('break-done'),
    nextTimerButton: document.getElementById('next-timer'),
    workTimeRatingInput: document.getElementById('work-time-rating'),
    workRatingValueDisplay: document.getElementById('work-rating-value'),
    breakTimeRatingInput: document.getElementById('break-time-rating'),
    breakRatingValueDisplay: document.getElementById('break-rating-value'),
    workFeedbackToggle: document.getElementById('work-feedback-toggle'),
    breakFeedbackToggle: document.getElementById('break-feedback-toggle'),
    workFeedbackForm: document.getElementById('work-feedback-form'),
    breakFeedbackForm: document.getElementById('break-feedback-form'),
    workChooseTagButton: document.getElementById('work-choose-tag'),
    breakChooseTagButton: document.getElementById('break-choose-tag'),
    workTagDisplay: document.getElementById('work-tag-display'),
    breakTagDisplay: document.getElementById('break-tag-display')
};

// DOM elements for serialization module
const serializationElements = {
    timerStatusElement: document.getElementById('timer-status')
};

// DOM elements for tag module
const tagElements = {
    tagPopupContainer: document.getElementById('tag-popup-container'),
    tagSearchInput: document.getElementById('tag-search-input'),
    tagsList: document.getElementById('tags-list'),
    newTagInput: document.getElementById('new-tag-input'),
    createTagButton: document.getElementById('create-tag-button'),
    closeTagPopupButton: document.getElementById('close-tag-popup'),
    workChooseTagButton: document.getElementById('work-choose-tag'),
    breakChooseTagButton: document.getElementById('break-choose-tag'),
    workTagDisplay: document.getElementById('work-tag-display'),
    breakTagDisplay: document.getElementById('break-tag-display')
};

// DOM elements for schedule module
const scheduleElements = {
    scheduleBuilder: document.getElementById('schedule-builder'),
    currentScheduleName: document.getElementById('current-schedule-name'),
    scheduleInstancesList: document.getElementById('schedule-instances-list'),
    noScheduleInstancesMessage: document.getElementById('no-schedule-instances-message'),
    availableInstancesList: document.getElementById('available-instances-list'),
    noAvailableInstancesMessage: document.getElementById('no-available-instances-message'),
    saveScheduleButton: document.getElementById('save-schedule'),
    cancelScheduleButton: document.getElementById('cancel-schedule'),
    scheduleRunner: document.getElementById('schedule-runner'),
    runningScheduleName: document.getElementById('running-schedule-name'),
    currentTimerName: document.getElementById('current-timer-name'),
    currentTimerIndex: document.getElementById('current-timer-index'),
    totalTimers: document.getElementById('total-timers'),
    scheduleFeedback: document.getElementById('schedule-feedback'),
    scheduleFeedbackText: document.getElementById('schedule-feedback-text'),
    scheduleRating: document.getElementById('schedule-rating'),
    scheduleRatingValue: document.getElementById('schedule-rating-value'),
    submitScheduleFeedbackButton: document.getElementById('submit-schedule-feedback'),
    nextTimerButton: document.getElementById('next-timer')
};

// DOM elements for saved timers section
const savedInstancesList = document.getElementById('saved-instances-list');
const instanceNameInput = document.getElementById('instance-name');
const saveInstanceButton = document.getElementById('save-instance');
const noInstancesMessage = document.getElementById('no-instances-message');

// DOM elements for saved schedules section
const savedSchedulesList = document.getElementById('saved-schedules-list');
const scheduleNameInput = document.getElementById('schedule-name');
const createScheduleButton = document.getElementById('create-schedule');
const noSchedulesMessage = document.getElementById('no-schedules-message');

// Initialize modules
function initializeModules() {
    // Initialize audio module
    alarmModule.initAudioModule();
    
    // Initialize timer module
    timerModule.initTimerModule(timerElements);
    
    // Initialize serialization module
    serializationModule.initSerializationModule(serializationElements);
    
    // Initialize tag module
    tagModule.initTagModule(tagElements);
    
    // Initialize schedule module with references to other modules
    scheduleModule.initScheduleModule(scheduleElements, {
        timerModule,
        serializationModule
    });
    
    // Make modules available globally for cross-module communication
    window.alarmModule = alarmModule;
    window.serializationModule = serializationModule;
    window.tagModule = tagModule;
    
    // Now that all modules are available globally, load tags
    tagModule.loadTags();
}

// Set up navigation
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the section to show
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all links and sections
            navLinks.forEach(link => link.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show the selected section
            if (sectionId === 'timer') {
                document.getElementById('timer-section').classList.add('active');
            } else if (sectionId === 'saved-timers') {
                document.getElementById('saved-timers-section').classList.add('active');
                // Refresh instances when navigating to this section
                loadInstances();
            } else if (sectionId === 'schedules') {
                document.getElementById('schedules-section').classList.add('active');
                // Refresh schedules when navigating to this section
                loadSchedules();
            }
        });
    });
}

// Load all saved instances
function loadInstances() {
    serializationModule.loadInstances()
        .then(instances => {
            // Clear the current list
            savedInstancesList.innerHTML = '';
            
            if (instances && instances.length > 0) {
                // Hide the "no instances" message
                noInstancesMessage.style.display = 'none';
                
                // Add each instance to the list
                instances.forEach(instance => {
                    const instanceElement = createInstanceElement(instance);
                    savedInstancesList.appendChild(instanceElement);
                });
            } else {
                // Show the "no instances" message
                noInstancesMessage.style.display = 'block';
            }
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
    timerModule.setTimerValues(
        instance.workTimer.minutes,
        instance.workTimer.seconds,
        instance.breakTimer.minutes,
        instance.breakTimer.seconds
    );
    
    timerModule.setTimerStatus(`Loaded timer: ${instance.name}`);
}

// Delete an instance
function deleteInstance(id) {
    serializationModule.deleteInstance(id)
        .then(success => {
            if (success) {
                loadInstances(); // Refresh the instances list
            }
        });
}

// Save current timer settings as a named instance
function saveInstance() {
    const name = instanceNameInput.value.trim();
    
    if (!name) {
        serializationModule.setStatus('Please enter a name for the timer');
        return;
    }
    
    // Get current timer values
    const timerValues = timerModule.getTimerValues();
    
    // Validate input
    if (timerValues.workMinutes === 0 && timerValues.workSeconds === 0) {
        serializationModule.setStatus('Please set a work time greater than 0');
        return;
    }
    
    if (timerValues.breakMinutes === 0 && timerValues.breakSeconds === 0) {
        serializationModule.setStatus('Please set a break time greater than 0');
        return;
    }
    
    // Create instance data
    const instanceData = {
        name: name,
        workTimer: {
            minutes: timerValues.workMinutes,
            seconds: timerValues.workSeconds
        },
        breakTimer: {
            minutes: timerValues.breakMinutes,
            seconds: timerValues.breakSeconds
        }
    };
    
    // Save instance
    serializationModule.saveInstance(instanceData)
        .then(() => {
            instanceNameInput.value = '';
            loadInstances(); // Refresh the instances list
        })
        .catch(error => {
            console.error('Error saving instance:', error);
        });
}

// Load all saved schedules
function loadSchedules() {
    serializationModule.loadSchedules()
        .then(schedules => {
            // Clear the current list
            savedSchedulesList.innerHTML = '';
            
            if (schedules && schedules.length > 0) {
                // Hide the "no schedules" message
                noSchedulesMessage.style.display = 'none';
                
                // Add each schedule to the list
                schedules.forEach(schedule => {
                    const scheduleElement = scheduleModule.createScheduleElement(
                        schedule,
                        scheduleModule.runSchedule,
                        editSchedule,
                        deleteSchedule
                    );
                    savedSchedulesList.appendChild(scheduleElement);
                });
            } else {
                // Show the "no schedules" message
                noSchedulesMessage.style.display = 'block';
            }
        });
}

// Edit a schedule
function editSchedule(schedule) {
    // Switch to schedules section
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');
    
    // Remove active class from all links and sections
    navLinks.forEach(link => link.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    // Add active class to schedules link and section
    document.querySelector('.nav-link[data-section="schedules"]').classList.add('active');
    document.getElementById('schedules-section').classList.add('active');
    
    // Edit the schedule
    scheduleModule.editSchedule(schedule);
}

// Delete a schedule
function deleteSchedule(id) {
    serializationModule.deleteSchedule(id)
        .then(success => {
            if (success) {
                loadSchedules(); // Refresh the schedules list
            }
        });
}

// Create a new work schedule
function createSchedule() {
    const name = scheduleNameInput.value.trim();
    
    if (!name) {
        serializationModule.setStatus('Please enter a name for the schedule');
        return;
    }
    
    scheduleModule.createSchedule(name);
    scheduleNameInput.value = '';
}

// Set up event listeners
function setupEventListeners() {
    // Save instance button
    saveInstanceButton.addEventListener('click', saveInstance);
    
    // Create schedule button
    createScheduleButton.addEventListener('click', createSchedule);
    
    // Listen for schedules updated event
    document.addEventListener('schedules-updated', () => {
        loadSchedules();
        loadInstances();
    });
}

// Initialize the application
function initializeApp() {
    initializeModules();
    setupNavigation();
    setupEventListeners();
    loadInstances();
    loadSchedules();
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
