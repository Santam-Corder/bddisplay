const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 8080;
const DATA_FILE = path.join(__dirname, 'projects.json');

// Middleware to parse JSON
app.use(express.json());

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route to serve the TV Display.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'TV Display.html'));
});

// Helper to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf8');
};

// GET /api/projects - Retrieve all projects
app.get('/api/projects', (req, res) => {
    const projects = readData();
    res.json(projects);
});

// POST /api/projects - Add a new project
app.post('/api/projects', (req, res) => {
    const projects = readData();
    const newProject = req.body;
    projects.push(newProject);
    writeData(projects);
    res.status(201).json(newProject);
});

// PUT /api/projects/:id - Update an existing project
app.put('/api/projects/:id', (req, res) => {
    const projects = readData();
    const projectId = parseInt(req.params.id);
    const index = projects.findIndex(p => p.id === projectId);

    if (index !== -1) {
        projects[index] = { ...projects[index], ...req.body, id: projectId };
        writeData(projects);
        res.json(projects[index]);
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

// DELETE /api/projects/:id - Delete a project
app.delete('/api/projects/:id', (req, res) => {
    let projects = readData();
    const projectId = parseInt(req.params.id);
    const initialLength = projects.length;

    projects = projects.filter(p => p.id !== projectId);

    if (projects.length !== initialLength) {
        writeData(projects);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Project not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
