const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const dataDir = path.join(__dirname, 'data');
const instancesDir = path.join(dataDir, 'instances');
// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(instancesDir)) {
    fs.mkdirSync(instancesDir, { recursive: true });
}

// Helper function to get the week number
function getWeekNumber(date) {
    try {
        if (!date) {
            console.error('Invalid date provided to getWeekNumber:', date);
            return `${new Date().getFullYear()}-week00`;
        }
        
        const d = new Date(date);
        
        if (isNaN(d.getTime())) {
            console.error('Invalid date after conversion in getWeekNumber:', date);
            return `${new Date().getFullYear()}-week00`;
        }
        
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return `${d.getFullYear()}-week${weekNumber.toString().padStart(2, '0')}`;
    } catch (error) {
        console.error('Error in getWeekNumber:', error);
        return `${new Date().getFullYear()}-week00`;
    }
}

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}
app.get('/api/save-timer', (req, res) => {
    console.log(req.body);
})
// API endpoint to save session data
app.post('/api/save-timer', (req, res) => {
    try {
        const sessionData = req.body;
        
        // Add timestamp for this entry
        sessionData.savedAt = new Date().toISOString();
        
        // Get week identifier from the work start date
        const weekId = getWeekNumber(sessionData.work.startDateTime);
        const filePath = path.join(dataDir, `${weekId}.json`);
        
        // Read existing data or create new array
        let weekData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            weekData = JSON.parse(fileContent);
        }
        
        // Add new session data
        weekData.push(sessionData);
        
        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(weekData, null, 2));
        
        res.status(200).json({ success: true, message: 'Session data saved successfully', weekId });
    } catch (error) {
        console.error('Error saving session data:', error);
        res.status(500).json({ success: false, message: 'Failed to save session data' });
    }
});

// Start the server
try {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
    console.log('Server started successfully');
} catch (error) {
    console.error('Error starting server:', error);
}

// Log any unhandled errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// API endpoint to save a pomodoro instance
app.post('/api/save-instance', (req, res) => {
    try {
        const { name, workTimer, breakTimer } = req.body;
        
        if (!name || !workTimer || !breakTimer) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, workTimer, and breakTimer are required' 
            });
        }
        
        // Create a unique filename based on the instance name
        const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const filePath = path.join(instancesDir, filename);
        
        // Create the instance data
        const instanceData = {
            name,
            workTimer,
            breakTimer,
            createdAt: new Date().toISOString()
        };
        
        // Write to file
        fs.writeFileSync(filePath, JSON.stringify(instanceData, null, 2));
        
        res.status(200).json({ 
            success: true, 
            message: 'Pomodoro instance saved successfully',
            instance: instanceData
        });
    } catch (error) {
        console.error('Error saving pomodoro instance:', error);
        res.status(500).json({ success: false, message: 'Failed to save pomodoro instance' });
    }
});

// API endpoint to get all saved pomodoro instances
app.get('/api/instances', (req, res) => {
    try {
        // Ensure the instances directory exists
        if (!fs.existsSync(instancesDir)) {
            fs.mkdirSync(instancesDir, { recursive: true });
            return res.status(200).json({ instances: [] });
        }
        
        // Read all files in the instances directory
        const files = fs.readdirSync(instancesDir);
        const instances = [];
        
        // Parse each file and add to instances array
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(instancesDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const instance = JSON.parse(fileContent);
                instance.id = file.replace('.json', ''); // Use filename as ID
                instances.push(instance);
            }
        }
        
        res.status(200).json({ instances });
    } catch (error) {
        console.error('Error getting pomodoro instances:', error);
        res.status(500).json({ success: false, message: 'Failed to get pomodoro instances' });
    }
});

// API endpoint to delete a pomodoro instance
app.delete('/api/instances/:id', (req, res) => {
    try {
        const id = req.params.id;
        const filePath = path.join(instancesDir, `${id}.json`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Instance not found' });
        }
        
        // Delete the file
        fs.unlinkSync(filePath);
        
        res.status(200).json({ success: true, message: 'Instance deleted successfully' });
    } catch (error) {
        console.error('Error deleting pomodoro instance:', error);
        res.status(500).json({ success: false, message: 'Failed to delete pomodoro instance' });
    }
});
