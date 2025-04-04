// Schedule Module
// Handles all schedule-related functionality

// DOM elements
let scheduleBuilder;
let currentScheduleName;
let scheduleInstancesList;
let noScheduleInstancesMessage;
let availableInstancesList;
let noAvailableInstancesMessage;
let saveScheduleButton;
let cancelScheduleButton;
let scheduleRunner;
let runningScheduleName;
let currentTimerName;
let currentTimerIndex;
let totalTimers;
let scheduleFeedback;
let scheduleFeedbackText;
let scheduleRating;
let scheduleRatingValue;
let submitScheduleFeedbackButton;
let nextTimerButton;

// Schedule variables
let currentSchedule = null;
let currentScheduleInstances = [];
let currentInstanceIndex = -1;
let isRunningSchedule = false;

// Module references
let timerModule;
let serializationModule;

// Initialize schedule module
export function initScheduleModule(elements, modules) {
    // Store DOM elements
    scheduleBuilder = elements.scheduleBuilder;
    currentScheduleName = elements.currentScheduleName;
    scheduleInstancesList = elements.scheduleInstancesList;
    noScheduleInstancesMessage = elements.noScheduleInstancesMessage;
    availableInstancesList = elements.availableInstancesList;
    noAvailableInstancesMessage = elements.noAvailableInstancesMessage;
    saveScheduleButton = elements.saveScheduleButton;
    cancelScheduleButton = elements.cancelScheduleButton;
    scheduleRunner = elements.scheduleRunner;
    runningScheduleName = elements.runningScheduleName;
    currentTimerName = elements.currentTimerName;
    currentTimerIndex = elements.currentTimerIndex;
    totalTimers = elements.totalTimers;
    scheduleFeedback = elements.scheduleFeedback;
    scheduleFeedbackText = elements.scheduleFeedbackText;
    scheduleRating = elements.scheduleRating;
    scheduleRatingValue = elements.scheduleRatingValue;
    submitScheduleFeedbackButton = elements.submitScheduleFeedbackButton;
    nextTimerButton = elements.nextTimerButton;
    
    // Store module references
    timerModule = modules.timerModule;
    serializationModule = modules.serializationModule;
    
    // Set up event listeners
    saveScheduleButton.addEventListener('click', saveSchedule);
    cancelScheduleButton.addEventListener('click', cancelSchedule);
    submitScheduleFeedbackButton.addEventListener('click', submitScheduleFeedback);
    nextTimerButton.addEventListener('click', timerModule.handleNextTimer);
    
    // Update schedule rating display when slider changes
    scheduleRating.addEventListener('input', function() {
        scheduleRatingValue.textContent = this.value;
    });
    
    // Make module available globally for timer module to access
    window.scheduleModule = {
        isRunningSchedule: () => isRunningSchedule,
        isLastTimer: () => currentInstanceIndex === currentScheduleInstances.length - 1,
        showScheduleFeedback,
        startNextTimer
    };
}

// Create a new work schedule
export function createSchedule(name) {
    if (!name) {
        serializationModule.setStatus('Please enter a name for the schedule');
        return;
    }
    
    // Set current schedule name
    currentScheduleName.textContent = name;
    
    // Clear current schedule instances
    currentScheduleInstances = [];
    scheduleInstancesList.innerHTML = '';
    noScheduleInstancesMessage.style.display = 'block';
    
    // Show schedule builder
    scheduleBuilder.classList.remove('hidden');
    
    // Load available timers
    loadAvailableTimers();
}

// Load available timers for the schedule builder
function loadAvailableTimers() {
    // Clear available instances list
    availableInstancesList.innerHTML = '';
    
    // Load instances from server
    serializationModule.loadInstances()
        .then(instances => {
            if (instances && instances.length > 0) {
                // Hide the "no available instances" message
                noAvailableInstancesMessage.style.display = 'none';
                
                // Add each instance to the available instances list
                instances.forEach(instance => {
                    const instanceElement = createAvailableInstanceElement(instance);
                    availableInstancesList.appendChild(instanceElement);
                });
            } else {
                // Show the "no available instances" message
                noAvailableInstancesMessage.style.display = 'block';
            }
        });
}

// Create an HTML element for an available instance
function createAvailableInstanceElement(instance) {
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
            <button class="add-to-schedule">Add</button>
        </div>
    `;
    
    // Add event listener for add button
    const addButton = instanceElement.querySelector('.add-to-schedule');
    addButton.addEventListener('click', () => addInstanceToSchedule(instance));
    
    return instanceElement;
}

// Edit an existing schedule
export function editSchedule(schedule) {
    // Set current schedule
    currentSchedule = schedule;
    
    // Set current schedule name
    currentScheduleName.textContent = schedule.name;
    
    // Clear current schedule instances list in UI
    scheduleInstancesList.innerHTML = '';
    
    // Copy instances to current schedule instances
    currentScheduleInstances = [...schedule.instances];
    
    // Add each instance to the UI
    if (currentScheduleInstances.length > 0) {
        noScheduleInstancesMessage.style.display = 'none';
        currentScheduleInstances.forEach(instance => {
            addInstanceToScheduleUI(instance);
        });
    } else {
        noScheduleInstancesMessage.style.display = 'block';
    }
    
    // Show schedule builder
    scheduleBuilder.classList.remove('hidden');
    
    // Load available timers
    loadAvailableTimers();
}

// Add an instance to the schedule UI (without adding to currentScheduleInstances)
function addInstanceToScheduleUI(instance) {
    // Create schedule instance element
    const scheduleInstanceElement = document.createElement('div');
    scheduleInstanceElement.className = 'schedule-instance-item';
    
    const workTime = `${instance.workTimer.minutes.toString().padStart(2, '0')}:${instance.workTimer.seconds.toString().padStart(2, '0')}`;
    const breakTime = `${instance.breakTimer.minutes.toString().padStart(2, '0')}:${instance.breakTimer.seconds.toString().padStart(2, '0')}`;
    
    scheduleInstanceElement.innerHTML = `
        <div class="instance-info">
            <div class="instance-name">${instance.name}</div>
            <div class="instance-times">Work: ${workTime} / Break: ${breakTime}</div>
        </div>
        <div class="instance-actions">
            <button class="remove-instance">Remove</button>
        </div>
    `;
    
    // Add event listener for remove button
    const removeButton = scheduleInstanceElement.querySelector('.remove-instance');
    removeButton.addEventListener('click', () => {
        // Remove instance from current schedule instances
        const index = currentScheduleInstances.findIndex(i => i.id === instance.id);
        if (index !== -1) {
            currentScheduleInstances.splice(index, 1);
        }
        
        // Remove element from DOM
        scheduleInstancesList.removeChild(scheduleInstanceElement);
        
        // Show "no instances" message if no instances left
        if (currentScheduleInstances.length === 0) {
            noScheduleInstancesMessage.style.display = 'block';
        }
    });
    
    // Add element to DOM
    scheduleInstancesList.appendChild(scheduleInstanceElement);
}

// Add an instance to the current schedule
export function addInstanceToSchedule(instance) {
    // Add instance to current schedule instances
    currentScheduleInstances.push(instance);
    
    // Hide "no instances" message
    noScheduleInstancesMessage.style.display = 'none';
    
    // Create schedule instance element
    const scheduleInstanceElement = document.createElement('div');
    scheduleInstanceElement.className = 'schedule-instance-item';
    
    const workTime = `${instance.workTimer.minutes.toString().padStart(2, '0')}:${instance.workTimer.seconds.toString().padStart(2, '0')}`;
    const breakTime = `${instance.breakTimer.minutes.toString().padStart(2, '0')}:${instance.breakTimer.seconds.toString().padStart(2, '0')}`;
    
    scheduleInstanceElement.innerHTML = `
        <div class="instance-info">
            <div class="instance-name">${instance.name}</div>
            <div class="instance-times">Work: ${workTime} / Break: ${breakTime}</div>
        </div>
        <div class="instance-actions">
            <button class="remove-instance">Remove</button>
        </div>
    `;
    
    // Add event listener for remove button
    const removeButton = scheduleInstanceElement.querySelector('.remove-instance');
    removeButton.addEventListener('click', () => {
        // Remove instance from current schedule instances
        const index = currentScheduleInstances.findIndex(i => i.id === instance.id);
        if (index !== -1) {
            currentScheduleInstances.splice(index, 1);
        }
        
        // Remove element from DOM
        scheduleInstancesList.removeChild(scheduleInstanceElement);
        
        // Show "no instances" message if no instances left
        if (currentScheduleInstances.length === 0) {
            noScheduleInstancesMessage.style.display = 'block';
        }
    });
    
    // Add element to DOM
    scheduleInstancesList.appendChild(scheduleInstanceElement);
}

// Save the current schedule
function saveSchedule() {
    if (currentScheduleInstances.length === 0) {
        serializationModule.setStatus('Please add at least one timer to the schedule');
        return;
    }
    
    // Create schedule data
    const scheduleData = {
        name: currentScheduleName.textContent,
        instances: currentScheduleInstances
    };
    
    // If we're editing an existing schedule, include its ID
    if (currentSchedule && currentSchedule.id) {
        scheduleData.id = currentSchedule.id;
    }
    
    // Send data to server
    serializationModule.saveSchedule(scheduleData)
        .then(() => {
            // Hide schedule builder
            scheduleBuilder.classList.add('hidden');
            
            // Clear current schedule instances and reset currentSchedule
            currentScheduleInstances = [];
            currentSchedule = null;
            
            // Trigger events to refresh UI
            const event = new CustomEvent('schedules-updated');
            document.dispatchEvent(event);
        })
        .catch(error => {
            console.error('Error saving schedule:', error);
        });
}

// Cancel schedule creation or editing
function cancelSchedule() {
    // Hide schedule builder
    scheduleBuilder.classList.add('hidden');
    
    // Clear current schedule instances and reset currentSchedule
    currentScheduleInstances = [];
    currentSchedule = null;
    
    // Trigger events to refresh UI
    const event = new CustomEvent('schedules-updated');
    document.dispatchEvent(event);
}

// Create an HTML element for a schedule
export function createScheduleElement(schedule, onRunSchedule, onEditSchedule, onDeleteSchedule) {
    const scheduleElement = document.createElement('div');
    scheduleElement.className = 'schedule-item';
    
    scheduleElement.innerHTML = `
        <div class="schedule-info">
            <div class="schedule-name">${schedule.name}</div>
            <div class="schedule-details">${schedule.instances.length} timers</div>
        </div>
        <div class="instance-actions">
            <button class="run-schedule">Run</button>
            <button class="edit-schedule">Edit</button>
            <button class="delete-schedule">Delete</button>
        </div>
    `;
    
    // Add event listener for run button
    const runButton = scheduleElement.querySelector('.run-schedule');
    runButton.addEventListener('click', () => onRunSchedule(schedule));
    
    // Add event listener for edit button
    const editButton = scheduleElement.querySelector('.edit-schedule');
    editButton.addEventListener('click', () => onEditSchedule(schedule));
    
    // Add event listener for delete button
    const deleteButton = scheduleElement.querySelector('.delete-schedule');
    deleteButton.addEventListener('click', () => onDeleteSchedule(schedule.id));
    
    return scheduleElement;
}

// Run a schedule
export function runSchedule(schedule) {
    // Set current schedule
    currentSchedule = schedule;
    currentScheduleInstances = schedule.instances;
    currentInstanceIndex = -1; // Start at -1 because startNextTimer will increment it to 0
    isRunningSchedule = true;
    
    // Set running schedule name
    runningScheduleName.textContent = schedule.name;
    
    // Set total timers
    totalTimers.textContent = schedule.instances.length;
    
    // Switch to timer section
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.app-section');
    
    // Remove active class from all links and sections
    navLinks.forEach(link => link.classList.remove('active'));
    sections.forEach(section => section.classList.remove('active'));
    
    // Add active class to timer link and section
    document.querySelector('.nav-link[data-section="timer"]').classList.add('active');
    document.getElementById('timer-section').classList.add('active');
    
    // Show schedule runner
    scheduleRunner.classList.remove('hidden');
    
    // Start the first timer
    startNextTimer();
}

// Start the next timer in the schedule
export function startNextTimer() {
    // Increment the current instance index
    currentInstanceIndex++;
    
    if (currentInstanceIndex >= currentScheduleInstances.length) {
        // All timers completed
        isRunningSchedule = false;
        scheduleRunner.classList.add('hidden');
        showScheduleFeedback();
        return;
    }
    
    // Get the current instance
    const instance = currentScheduleInstances[currentInstanceIndex];
    
    console.log("Starting timer:", instance);
    
    // Set timer values
    timerModule.setTimerValues(
        instance.workTimer.minutes,
        instance.workTimer.seconds,
        instance.breakTimer.minutes,
        instance.breakTimer.seconds
    );
    
    // Set current timer info
    currentTimerName.textContent = instance.name;
    currentTimerIndex.textContent = currentInstanceIndex + 1;
    
    // Update status
    timerModule.setTimerStatus(`Running schedule: ${currentSchedule.name} - Timer ${currentInstanceIndex + 1} of ${currentScheduleInstances.length}`);
    
    // Start the timer
    timerModule.startTimer(true);
}

// Show schedule feedback form
export function showScheduleFeedback() {
    // Hide schedule runner
    scheduleRunner.classList.add('hidden');
    
    // Reset schedule feedback form
    scheduleFeedbackText.value = '';
    scheduleRating.value = 5;
    scheduleRatingValue.textContent = '5';
    
    // Show schedule feedback form
    scheduleFeedback.classList.remove('hidden');
}

// Submit schedule feedback
function submitScheduleFeedback() {
    const feedback = scheduleFeedbackText.value.trim();
    const rating = parseInt(scheduleRating.value);
    
    // Send feedback to server
    serializationModule.submitScheduleFeedback(currentSchedule.id, feedback, rating)
        .then(success => {
            if (success) {
                // Hide schedule feedback form
                scheduleFeedback.classList.add('hidden');
                
                // Reset schedule variables
                currentSchedule = null;
                currentScheduleInstances = [];
                currentInstanceIndex = -1;
                isRunningSchedule = false;
            }
        });
}

// Check if a schedule is running
export function isScheduleRunning() {
    return isRunningSchedule;
}

// Export module
export default {
    initScheduleModule,
    createSchedule,
    editSchedule,
    addInstanceToSchedule,
    createScheduleElement,
    runSchedule,
    startNextTimer,
    showScheduleFeedback,
    isScheduleRunning
};
