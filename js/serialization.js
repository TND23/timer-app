// Serialization Module
// Handles all data saving and loading functionality

// DOM elements
let timerStatusElement;

// Initialize serialization module
export function initSerializationModule(elements) {
    // Store DOM elements
    timerStatusElement = elements.timerStatusElement;
}

// Save session data to JSON file in the data folder
export function saveSessionData(sessionData) {
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

// Save a pomodoro instance
export function saveInstance(instanceData) {
    // Show saving status
    timerStatusElement.textContent = 'Saving timer...';
    
    return fetch('/api/save-instance', {
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
            return data;
        } else {
            timerStatusElement.textContent = 'Error saving timer';
            console.error('Error:', data.message);
            throw new Error(data.message);
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error saving timer';
        console.error('Error:', error);
        throw error;
    });
}

// Load all saved instances
export function loadInstances() {
    return fetch('/api/instances')
        .then(response => response.json())
        .then(data => {
            return data.instances || [];
        })
        .catch(error => {
            console.error('Error loading instances:', error);
            timerStatusElement.textContent = 'Error loading saved timers';
            return [];
        });
}

// Delete an instance
export function deleteInstance(id) {
    return fetch(`/api/instances/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            timerStatusElement.textContent = 'Timer deleted successfully';
            return true;
        } else {
            timerStatusElement.textContent = 'Error deleting timer';
            console.error('Error:', data.message);
            return false;
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error deleting timer';
        console.error('Error:', error);
        return false;
    });
}

// Save a work schedule
export function saveSchedule(scheduleData) {
    // Show saving status
    timerStatusElement.textContent = 'Saving schedule...';
    
    return fetch('/api/save-schedule', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scheduleData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            timerStatusElement.textContent = 'Schedule saved successfully';
            return data;
        } else {
            timerStatusElement.textContent = 'Error saving schedule';
            console.error('Error:', data.message);
            throw new Error(data.message);
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error saving schedule';
        console.error('Error:', error);
        throw error;
    });
}

// Load all saved schedules
export function loadSchedules() {
    return fetch('/api/schedules')
        .then(response => response.json())
        .then(data => {
            return data.schedules || [];
        })
        .catch(error => {
            console.error('Error loading schedules:', error);
            timerStatusElement.textContent = 'Error loading saved schedules';
            return [];
        });
}

// Delete a schedule
export function deleteSchedule(id) {
    return fetch(`/api/schedules/${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            timerStatusElement.textContent = 'Schedule deleted successfully';
            return true;
        } else {
            timerStatusElement.textContent = 'Error deleting schedule';
            console.error('Error:', data.message);
            return false;
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error deleting schedule';
        console.error('Error:', error);
        return false;
    });
}

// Submit schedule feedback
export function submitScheduleFeedback(scheduleId, feedback, rating) {
    // Send feedback to server
    timerStatusElement.textContent = 'Submitting feedback...';
    
    return fetch(`/api/schedule-feedback/${scheduleId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            feedback,
            rating
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            timerStatusElement.textContent = 'Feedback submitted successfully';
            return true;
        } else {
            timerStatusElement.textContent = 'Error submitting feedback';
            console.error('Error:', data.message);
            return false;
        }
    })
    .catch(error => {
        timerStatusElement.textContent = 'Error submitting feedback';
        console.error('Error:', error);
        return false;
    });
}

// Set status message
export function setStatus(message) {
    timerStatusElement.textContent = message;
}

// Export module
export default {
    initSerializationModule,
    saveSessionData,
    saveInstance,
    loadInstances,
    deleteInstance,
    saveSchedule,
    loadSchedules,
    deleteSchedule,
    submitScheduleFeedback,
    setStatus
};
