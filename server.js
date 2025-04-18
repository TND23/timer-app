const { debug } = require('console');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const dataDir = path.join(__dirname, 'data');
const instancesDir = path.join(dataDir, 'instances');
const schedulesDir = path.join(dataDir, 'schedules');
const tagsDir = path.join(dataDir, 'tags');
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
if (!fs.existsSync(schedulesDir)) {
    fs.mkdirSync(schedulesDir, { recursive: true });
}
if (!fs.existsSync(tagsDir)) {
    fs.mkdirSync(tagsDir, { recursive: true });
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

// API endpoint to update a pomodoro instance
app.put('/api/instances/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { name, workTimer, breakTimer } = req.body;
        const filePath = path.join(instancesDir, `${id}.json`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Instance not found' });
        }
        
        if (!name || !workTimer || !breakTimer) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, workTimer, and breakTimer are required' 
            });
        }
        
        // Read existing data to preserve creation date
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(fileContent);
        
        // Create the updated instance data
        const instanceData = {
            name,
            workTimer,
            breakTimer,
            updatedAt: new Date().toISOString()
        };
        
        // Preserve createdAt date
        if (existingData.createdAt) {
            instanceData.createdAt = existingData.createdAt;
        }
        
        // Write to file
        fs.writeFileSync(filePath, JSON.stringify(instanceData, null, 2));
        
        // Add id to response
        instanceData.id = id;
        
        res.status(200).json({ 
            success: true, 
            message: 'Pomodoro instance updated successfully',
            instance: instanceData
        });
    } catch (error) {
        console.error('Error updating pomodoro instance:', error);
        res.status(500).json({ success: false, message: 'Failed to update pomodoro instance' });
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

// API endpoint to save a work schedule
app.post('/api/save-schedule', (req, res) => {
    try {
        const { name, instances } = req.body;
        
        if (!name || !instances || !Array.isArray(instances) || instances.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name and instances (array) are required' 
            });
        }
        
        // Create a unique filename based on the schedule name
        const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const filePath = path.join(schedulesDir, filename);
        
        // Create the schedule data
        const scheduleData = {
            name,
            instances,
            createdAt: new Date().toISOString()
        };
        
        // Write to file
        fs.writeFileSync(filePath, JSON.stringify(scheduleData, null, 2));
        
        res.status(200).json({ 
            success: true, 
            message: 'Work schedule saved successfully',
            schedule: scheduleData
        });
    } catch (error) {
        console.error('Error saving work schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to save work schedule' });
    }
});

// API endpoint to get all saved work schedules
app.get('/api/schedules', (req, res) => {
    try {
        // Ensure the schedules directory exists
        if (!fs.existsSync(schedulesDir)) {
            fs.mkdirSync(schedulesDir, { recursive: true });
            return res.status(200).json({ schedules: [] });
        }
        
        // Read all files in the schedules directory
        const files = fs.readdirSync(schedulesDir);
        const schedules = [];
        
        // Parse each file and add to schedules array
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(schedulesDir, file);
                const fileContent = fs.readFileSync(filePath, 'utf8');
                const schedule = JSON.parse(fileContent);
                schedule.id = file.replace('.json', ''); // Use filename as ID
                schedules.push(schedule);
            }
        }
        
        res.status(200).json({ schedules });
    } catch (error) {
        console.error('Error getting work schedules:', error);
        res.status(500).json({ success: false, message: 'Failed to get work schedules' });
    }
});

// API endpoint to get a specific work schedule
app.get('/api/schedules/:id', (req, res) => {
    try {
        const id = req.params.id;
        const filePath = path.join(schedulesDir, `${id}.json`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        // Read the file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const schedule = JSON.parse(fileContent);
        schedule.id = id;
        
        res.status(200).json({ schedule });
    } catch (error) {
        console.error('Error getting work schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to get work schedule' });
    }
});

// API endpoint to update a specific work schedule
app.put('/api/schedules/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { name, instances } = req.body;
        const filePath = path.join(schedulesDir, `${id}.json`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        if (!name || !instances || !Array.isArray(instances) || instances.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name and instances (array) are required' 
            });
        }
        
        // Create the updated schedule data
        const scheduleData = {
            name,
            instances,
            updatedAt: new Date().toISOString()
        };
        
        // Read existing data to preserve creation date
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const existingData = JSON.parse(fileContent);
        
        // Preserve createdAt date
        if (existingData.createdAt) {
            scheduleData.createdAt = existingData.createdAt;
        }
        
        // Write to file
        fs.writeFileSync(filePath, JSON.stringify(scheduleData, null, 2));
        
        // Add id to response
        scheduleData.id = id;
        
        res.status(200).json({ 
            success: true, 
            message: 'Work schedule updated successfully',
            schedule: scheduleData
        });
    } catch (error) {
        console.error('Error updating work schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to update work schedule' });
    }
});

// API endpoint to delete a work schedule
app.delete('/api/schedules/:id', (req, res) => {
    try {
        const id = req.params.id;
        const filePath = path.join(schedulesDir, `${id}.json`);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ success: false, message: 'Schedule not found' });
        }
        
        // Delete the file
        fs.unlinkSync(filePath);
        
        res.status(200).json({ success: true, message: 'Schedule deleted successfully' });
    } catch (error) {
        console.error('Error deleting work schedule:', error);
        res.status(500).json({ success: false, message: 'Failed to delete work schedule' });
    }
});

app.get('/api/tags', (req, res) => {
    try {
        if (!fs.existsSync(tagsDir)) {
            fs.mkdirSync(tagsDir, { recursive: true });
            return res.status(200).json({ tags: [] });
        }       
        const tagsFilePath = path.join(tagsDir, 'tags.json');
        
        if (!fs.existsSync(tagsFilePath)) {
            return res.status(200).json({ tags: [] });
        }
        
        // Read and parse tags file
        const fileContent = fs.readFileSync(tagsFilePath, 'utf8');
        const tagsData = JSON.parse(fileContent);
        
        res.status(200).json({ tags: tagsData.tags || [] });
    } catch (error) {
        console.error('Error getting tags:', error);
        res.status(500).json({ success: false, message: 'Failed to get tags' });
    }
});

// API endpoint to save a new tag
app.post('/api/tags', (req, res) => {
    try {
        const { tag } = req.body;
        
        if (!tag) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required field: tag is required' 
            });
        }
        
        // Ensure the tags directory exists
        if (!fs.existsSync(tagsDir)) {
            fs.mkdirSync(tagsDir, { recursive: true });
        }
        
        // Path to tags file
        const tagsFilePath = path.join(tagsDir, 'tags.json');
        
        // Read existing tags or create new array
        let tagsData = { tags: [] };
        if (fs.existsSync(tagsFilePath)) {
            const fileContent = fs.readFileSync(tagsFilePath, 'utf8');
            tagsData = JSON.parse(fileContent);
        }
        
        // Check if tag already exists
        if (!tagsData.tags.includes(tag)) {
            // Add new tag
            tagsData.tags.push(tag);
            
            // Write back to file
            fs.writeFileSync(tagsFilePath, JSON.stringify(tagsData, null, 2));
        }
        
        res.status(200).json({ 
            success: true, 
            message: 'Tag saved successfully',
            tags: tagsData.tags
        });
    } catch (error) {
        console.error('Error saving tag:', error);
        res.status(500).json({ success: false, message: 'Failed to save tag' });
    }
});

// API endpoint to delete a tag
app.delete('/api/tags/:tag', (req, res) => {
    try {
        const tagToDelete = decodeURIComponent(req.params.tag);
        
        // Path to tags file
        const tagsFilePath = path.join(tagsDir, 'tags.json');
        
        // Check if tags file exists
        if (!fs.existsSync(tagsFilePath)) {
            return res.status(404).json({ success: false, message: 'No tags found' });
        }
        
        // Read and parse tags file
        const fileContent = fs.readFileSync(tagsFilePath, 'utf8');
        const tagsData = JSON.parse(fileContent);
        
        // Filter out the tag to delete
        tagsData.tags = tagsData.tags.filter(tag => tag !== tagToDelete);
        
        // Write back to file
        fs.writeFileSync(tagsFilePath, JSON.stringify(tagsData, null, 2));
        
        res.status(200).json({ 
            success: true, 
            message: 'Tag deleted successfully',
            tags: tagsData.tags
        });
    } catch (error) {
        console.error('Error deleting tag:', error);
        res.status(500).json({ success: false, message: 'Failed to delete tag' });
    }
});

// API endpoint to save schedule completion feedback
app.post('/api/schedule-feedback/:id', (req, res) => {
    try {
        const id = req.params.id;
        const { feedback, rating } = req.body;
        
        if (feedback === undefined || rating === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: feedback and rating are required' 
            });
        }
        
        // Create a unique filename for the feedback
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${id}_feedback_${timestamp}.json`;
        const filePath = path.join(schedulesDir, 'feedback', filename);
        
        // Ensure feedback directory exists
        const feedbackDir = path.join(schedulesDir, 'feedback');
        if (!fs.existsSync(feedbackDir)) {
            fs.mkdirSync(feedbackDir, { recursive: true });
        }
        
        // Create the feedback data
        const feedbackData = {
            scheduleId: id,
            feedback,
            rating: parseInt(rating),
            submittedAt: new Date().toISOString()
        };
        
        // Write to file
        fs.writeFileSync(filePath, JSON.stringify(feedbackData, null, 2));
        
        res.status(200).json({ 
            success: true, 
            message: 'Schedule feedback saved successfully',
            feedback: feedbackData
        });
    } catch (error) {
        console.error('Error saving schedule feedback:', error);
        res.status(500).json({ success: false, message: 'Failed to save schedule feedback' });
    }
});
