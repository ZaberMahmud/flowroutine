// Main Application State
const state = {
    currentTab: 'routine-builder',
    selectedTask: null,
    routineTasks: [],
    savedRoutines: [],
    taskLibrary: [
        { id: 1, name: 'Morning Meditation', category: 'morning', duration: 15, color: '#4f46e5', priority: 'high' },
        { id: 2, name: 'Breakfast', category: 'morning', duration: 20, color: '#f59e0b', priority: 'medium' },
        { id: 3, name: 'Exercise', category: 'fitness', duration: 45, color: '#10b981', priority: 'high' },
        { id: 4, name: 'Check Emails', category: 'work', duration: 30, color: '#3b82f6', priority: 'medium' },
        { id: 5, name: 'Deep Work Session', category: 'work', duration: 90, color: '#8b5cf6', priority: 'high' },
        { id: 6, name: 'Lunch Break', category: 'work', duration: 45, color: '#f59e0b', priority: 'medium' },
        { id: 7, name: 'Meeting', category: 'work', duration: 60, color: '#ef4444', priority: 'medium' },
        { id: 8, name: 'Reading', category: 'evening', duration: 30, color: '#8b5cf6', priority: 'low' },
        { id: 9, name: 'Dinner', category: 'evening', duration: 45, color: '#f59e0b', priority: 'medium' },
        { id: 10, name: 'Plan Tomorrow', category: 'evening', duration: 15, color: '#4f46e5', priority: 'medium' },
        { id: 11, name: 'Evening Walk', category: 'evening', duration: 30, color: '#10b981', priority: 'low' }
    ],
    analyticsData: {
        completion: [65, 72, 80, 78, 85, 90, 82],
        distribution: { morning: 3, work: 4, fitness: 1, evening: 3 }
    }
};

// DOM Elements
const tabContents = document.querySelectorAll('.tab-content');
const navLinks = document.querySelectorAll('.nav-link');
const taskLibraryList = document.getElementById('task-library-list');
const routineTasksContainer = document.getElementById('routine-tasks-container');
const timeSlots = document.querySelector('.time-slots');
const selectedTaskInfo = document.getElementById('selected-task-info');
const totalTasksEl = document.getElementById('total-tasks');
const totalDurationEl = document.getElementById('total-duration');
const productivityScoreEl = document.getElementById('productivity-score');
const saveRoutineBtn = document.getElementById('save-routine');
const clearRoutineBtn = document.getElementById('clear-routine');
const exportBtn = document.getElementById('export-btn');
const saveModal = document.getElementById('save-modal');
const confirmSaveBtn = document.getElementById('confirm-save');
const modalClose = document.querySelector('.modal-close');
const modalCancel = document.querySelector('.modal-cancel');
const toast = document.getElementById('toast');
const savedRoutinesContainer = document.getElementById('saved-routines');
const taskSearch = document.getElementById('task-search');
const categoryBtns = document.querySelectorAll('.category-btn');
const customTaskBtn = document.getElementById('add-custom-task');
const customTaskName = document.getElementById('custom-task-name');
const customTaskCategory = document.getElementById('custom-task-category');
const updateTaskBtn = document.getElementById('update-task-btn');
const taskDuration = document.getElementById('task-duration');
const taskPriority = document.getElementById('task-priority');
const colorOptions = document.querySelectorAll('.color-option');
const importFileInput = document.getElementById('import-file');
const importRoutinesBtn = document.getElementById('import-routines');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    loadFromLocalStorage();
    renderAnalyticsCharts();
});

function initApp() {
    renderTaskLibrary();
    renderTimeSlots();
    renderRoutineTasks();
    updateRoutineSummary();
    renderSavedRoutines();
    
    // Select first task in library by default
    if (state.taskLibrary.length > 0) {
        selectTask(state.taskLibrary[0]);
    }
}

function setupEventListeners() {
    // Tab navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
            
            // Update active nav link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');
        });
    });
    
    // Save routine button
    saveRoutineBtn.addEventListener('click', () => {
        saveModal.classList.add('active');
    });
    
    // Clear routine button
    clearRoutineBtn.addEventListener('click', clearRoutine);
    
    // Export button
    exportBtn.addEventListener('click', () => {
        showExportModal();
    });
    
    // Modal buttons
    modalClose.addEventListener('click', () => {
        saveModal.classList.remove('active');
    });
    
    modalCancel.addEventListener('click', () => {
        saveModal.classList.remove('active');
    });
    
    confirmSaveBtn.addEventListener('click', saveRoutine);
    
    // Task search
    taskSearch.addEventListener('input', renderTaskLibrary);
    
    // Category filter buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTaskLibrary();
        });
    });
    
    // Add custom task
    customTaskBtn.addEventListener('click', addCustomTask);
    
    // Update task button
    updateTaskBtn.addEventListener('click', updateSelectedTask);
    
    // Color options
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            colorOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // Set first color as active by default
    if (colorOptions.length > 0) {
        colorOptions[0].classList.add('active');
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === saveModal) {
            saveModal.classList.remove('active');
        }
    });
    
    // Export buttons in settings
    document.getElementById('export-json').addEventListener('click', () => exportRoutine('json'));
    document.getElementById('export-csv').addEventListener('click', () => exportRoutine('csv'));
    document.getElementById('export-pdf').addEventListener('click', showExportModal);
    
    // Import button
    importRoutinesBtn.addEventListener('click', () => {
        importFileInput.click();
    });
    
    // Import file change
    importFileInput.addEventListener('change', handleImportFile);
    
    // Theme selector
    document.getElementById('user-theme').addEventListener('change', (e) => {
        document.body.setAttribute('data-theme', e.target.value);
    });
}

function switchTab(tabId) {
    // Hide all tabs
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    
    state.currentTab = tabId;
    
    // If switching to analytics tab, update charts
    if (tabId === 'analytics') {
        setTimeout(renderAnalyticsCharts, 100);
    }
}

function renderTaskLibrary() {
    taskLibraryList.innerHTML = '';
    
    const searchTerm = taskSearch.value.toLowerCase();
    const activeCategory = document.querySelector('.category-btn.active').getAttribute('data-category');
    
    state.taskLibrary.forEach(task => {
        // Filter by category
        if (activeCategory !== 'all' && task.category !== activeCategory) return;
        
        // Filter by search term
        if (searchTerm && !task.name.toLowerCase().includes(searchTerm)) return;
        
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.category}`;
        taskElement.draggable = true;
        taskElement.setAttribute('data-task-id', task.id);
        taskElement.setAttribute('data-task-category', task.category);
        
        taskElement.innerHTML = `
            <h4>${task.name}</h4>
            <p>${task.duration} min • ${task.priority} priority</p>
        `;
        
        // Click to select task
        taskElement.addEventListener('click', () => {
            selectTask(task);
        });
        
        // Drag and drop functionality - FIXED
        taskElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', task.id.toString());
            e.dataTransfer.effectAllowed = 'copy';
            taskElement.classList.add('dragging');
        });
        
        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });
        
        taskLibraryList.appendChild(taskElement);
    });
}

function renderTimeSlots() {
    timeSlots.innerHTML = '';
    
    // Create time slots from 6 AM to 10 PM
    for (let hour = 6; hour <= 22; hour++) {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour;
        
        timeSlot.textContent = `${displayHour}:00 ${period}`;
        timeSlots.appendChild(timeSlot);
    }
}

function renderRoutineTasks() {
    routineTasksContainer.innerHTML = '';
    
    // Calculate total height for the timeline (60px per hour slot)
    const startHour = 6;
    const endHour = 22;
    const totalHours = endHour - startHour;
    const timelineHeight = totalHours * 60;
    
    routineTasksContainer.style.height = `${timelineHeight}px`;
    
    // Render each task in the routine
    state.routineTasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'routine-task';
        taskElement.style.backgroundColor = task.color;
        
        // Calculate position based on start time
        const startTime = parseFloat(task.startTime);
        const taskStartHour = Math.floor(startTime);
        const taskStartMinute = (startTime - taskStartHour) * 60;
        
        // Calculate position from top (6 AM = 0px)
        const startPosition = ((taskStartHour - startHour) * 60) + taskStartMinute;
        const taskHeight = task.duration;
        
        taskElement.style.top = `${startPosition}px`;
        taskElement.style.height = `${taskHeight}px`;
        
        taskElement.innerHTML = `
            <h4>${task.name} <span class="task-time">${formatTime(startTime)} - ${formatTime(startTime + task.duration/60)}</span></h4>
            <p>${task.category} • ${task.priority} priority</p>
            <div class="task-remove" data-task-index="${index}"><i class="fas fa-times"></i></div>
        `;
        
        // Click to select task
        taskElement.addEventListener('click', (e) => {
            if (!e.target.closest('.task-remove')) {
                selectTask(task);
            }
        });
        
        // Remove task button
        const removeBtn = taskElement.querySelector('.task-remove');
        removeBtn.addEventListener('click', () => {
            state.routineTasks.splice(index, 1);
            renderRoutineTasks();
            updateRoutineSummary();
            saveToLocalStorage();
        });
        
        routineTasksContainer.appendChild(taskElement);
    });
    
    // Setup drop zone for drag and drop - FIXED
    routineTasksContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        routineTasksContainer.classList.add('drag-over');
    });
    
    routineTasksContainer.addEventListener('dragenter', (e) => {
        e.preventDefault();
    });
    
    routineTasksContainer.addEventListener('dragleave', () => {
        routineTasksContainer.classList.remove('drag-over');
    });
    
    routineTasksContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        routineTasksContainer.classList.remove('drag-over');
        
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        const task = state.taskLibrary.find(t => t.id === taskId);
        
        if (task) {
            // Calculate drop position as time
            const rect = routineTasksContainer.getBoundingClientRect();
            const dropY = e.clientY - rect.top;
            
            // Convert pixel position to time (6 AM = 0px, 10 PM = 960px)
            const hoursFromTop = dropY / 60; // 60px per hour
            const startTime = 6 + hoursFromTop;
            
            // Round to nearest 15 minutes
            const roundedTime = Math.round(startTime * 4) / 4;
            
            // Check if time is within bounds
            if (roundedTime < 6 || roundedTime > 22) {
                showToast('Please drop task between 6 AM and 10 PM');
                return;
            }
            
            // Add task to routine
            const newTask = {
                ...task,
                startTime: roundedTime,
                id: Date.now() + Math.random() // Unique ID for this instance
            };
            
            state.routineTasks.push(newTask);
            renderRoutineTasks();
            updateRoutineSummary();
            saveToLocalStorage();
            
            showToast('Task added to routine!');
        }
    });
}

function selectTask(task) {
    state.selectedTask = task;
    
    // Update task details panel
    selectedTaskInfo.innerHTML = `
        <h4>${task.name}</h4>
        <p><strong>Category:</strong> ${task.category}</p>
        <p><strong>Duration:</strong> ${task.duration} minutes</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Color:</strong> <span style="display: inline-block; width: 15px; height: 15px; background-color: ${task.color}; border-radius: 3px;"></span></p>
    `;
    
    // Update task settings with selected task values
    taskDuration.value = task.duration;
    taskPriority.value = task.priority;
    
    // Set active color option
    colorOptions.forEach(option => {
        if (option.getAttribute('data-color') === task.color) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
    
    // Enable update button
    updateTaskBtn.disabled = false;
}

function updateSelectedTask() {
    if (!state.selectedTask) return;
    
    // Update task properties
    state.selectedTask.duration = parseInt(taskDuration.value);
    state.selectedTask.priority = taskPriority.value;
    
    // Get selected color
    const activeColor = document.querySelector('.color-option.active');
    if (activeColor) {
        state.selectedTask.color = activeColor.getAttribute('data-color');
    }
    
    // Update task in routine if it's there
    const taskIndex = state.routineTasks.findIndex(t => t.id === state.selectedTask.id);
    if (taskIndex !== -1) {
        state.routineTasks[taskIndex] = { ...state.selectedTask };
        renderRoutineTasks();
        updateRoutineSummary();
    }
    
    // Also update in task library if it's there
    const libraryIndex = state.taskLibrary.findIndex(t => t.id === state.selectedTask.id);
    if (libraryIndex !== -1) {
        state.taskLibrary[libraryIndex] = { ...state.selectedTask };
        renderTaskLibrary();
    }
    
    // Show success message
    showToast('Task updated successfully!');
    saveToLocalStorage();
}

function updateRoutineSummary() {
    const totalTasks = state.routineTasks.length;
    const totalDuration = state.routineTasks.reduce((sum, task) => sum + task.duration, 0);
    
    // Calculate productivity score based on high priority tasks
    const highPriorityTasks = state.routineTasks.filter(task => task.priority === 'high').length;
    const productivityScore = totalTasks > 0 ? Math.round((highPriorityTasks / totalTasks) * 100) : 0;
    
    totalTasksEl.textContent = totalTasks;
    totalDurationEl.textContent = `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`;
    productivityScoreEl.textContent = `${productivityScore}%`;
}

function clearRoutine() {
    if (state.routineTasks.length > 0) {
        if (confirm('Are you sure you want to clear your routine? This action cannot be undone.')) {
            state.routineTasks = [];
            renderRoutineTasks();
            updateRoutineSummary();
            saveToLocalStorage();
            showToast('Routine cleared successfully!');
        }
    }
}

function saveRoutine() {
    const name = document.getElementById('routine-name').value.trim();
    const description = document.getElementById('routine-description').value.trim();
    const tags = document.getElementById('routine-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (!name) {
        alert('Please enter a routine name');
        return;
    }
    
    if (state.routineTasks.length === 0) {
        alert('Your routine is empty. Add some tasks before saving.');
        return;
    }
    
    const routine = {
        id: Date.now(),
        name,
        description,
        tags,
        tasks: [...state.routineTasks],
        createdAt: new Date().toISOString(),
        totalTasks: state.routineTasks.length,
        totalDuration: state.routineTasks.reduce((sum, task) => sum + task.duration, 0)
    };
    
    state.savedRoutines.push(routine);
    renderSavedRoutines();
    saveToLocalStorage();
    
    // Close modal and reset form
    saveModal.classList.remove('active');
    document.getElementById('routine-name').value = '';
    document.getElementById('routine-description').value = '';
    document.getElementById('routine-tags').value = '';
    
    showToast('Routine saved successfully!');
    
    // Switch to My Routines tab
    switchTab('my-routines');
    document.querySelector(`[data-tab="my-routines"]`).click();
}

function renderSavedRoutines() {
    savedRoutinesContainer.innerHTML = '';
    
    if (state.savedRoutines.length === 0) {
        savedRoutinesContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus"></i>
                <h3>No routines saved yet</h3>
                <p>Create your first routine using the Builder tab</p>
            </div>
        `;
        return;
    }
    
    state.savedRoutines.forEach(routine => {
        const routineCard = document.createElement('div');
        routineCard.className = 'routine-card';
        
        // Calculate productivity score
        const highPriorityTasks = routine.tasks.filter(task => task.priority === 'high').length;
        const productivityScore = routine.tasks.length > 0 ? Math.round((highPriorityTasks / routine.tasks.length) * 100) : 0;
        
        routineCard.innerHTML = `
            <div class="routine-card-header">
                <h4>${routine.name}</h4>
                <span class="routine-date">${new Date(routine.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="routine-card-body">
                <p>${routine.description || 'No description'}</p>
                <div class="routine-stats">
                    <div class="routine-stat">
                        <div class="routine-stat-value">${routine.totalTasks}</div>
                        <div class="routine-stat-label">Tasks</div>
                    </div>
                    <div class="routine-stat">
                        <div class="routine-stat-value">${Math.floor(routine.totalDuration / 60)}h</div>
                        <div class="routine-stat-label">Duration</div>
                    </div>
                    <div class="routine-stat">
                        <div class="routine-stat-value">${productivityScore}%</div>
                        <div class="routine-stat-label">Productivity</div>
                    </div>
                </div>
                <div class="routine-tags">
                    ${routine.tags.map(tag => `<span class="routine-tag">${tag}</span>`).join('')}
                </div>
                <div class="routine-actions">
                    <button class="btn-small load-routine-btn" data-routine-id="${routine.id}"><i class="fas fa-play"></i> Load</button>
                    <button class="btn-small btn-outline export-routine-btn" data-routine-id="${routine.id}"><i class="fas fa-download"></i> Export</button>
                    <button class="btn-small btn-secondary delete-routine-btn" data-routine-id="${routine.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
        
        savedRoutinesContainer.appendChild(routineCard);
    });
    
    // Add event listeners to routine buttons
    document.querySelectorAll('.load-routine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const routineId = parseInt(btn.getAttribute('data-routine-id'));
            loadRoutine(routineId);
        });
    });
    
    document.querySelectorAll('.export-routine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const routineId = parseInt(btn.getAttribute('data-routine-id'));
            exportSingleRoutine(routineId);
        });
    });
    
    document.querySelectorAll('.delete-routine-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const routineId = parseInt(btn.getAttribute('data-routine-id'));
            deleteRoutine(routineId);
        });
    });
}

function loadRoutine(routineId) {
    const routine = state.savedRoutines.find(r => r.id === routineId);
    if (routine) {
        state.routineTasks = [...routine.tasks];
        renderRoutineTasks();
        updateRoutineSummary();
        showToast('Routine loaded successfully!');
        
        // Switch to builder tab
        switchTab('routine-builder');
        document.querySelector(`[data-tab="routine-builder"]`).click();
    }
}

function deleteRoutine(routineId) {
    if (confirm('Are you sure you want to delete this routine?')) {
        state.savedRoutines = state.savedRoutines.filter(r => r.id !== routineId);
        renderSavedRoutines();
        saveToLocalStorage();
        showToast('Routine deleted successfully!');
    }
}

function exportRoutine(format = 'json') {
    if (state.routineTasks.length === 0) {
        alert('Your routine is empty. Add some tasks before exporting.');
        return;
    }
    
    const routineData = {
        name: 'My Routine',
        createdAt: new Date().toISOString(),
        tasks: state.routineTasks
    };
    
    let dataStr, fileName, mimeType;
    
    if (format === 'json') {
        dataStr = JSON.stringify(routineData, null, 2);
        fileName = 'routine.json';
        mimeType = 'application/json';
        
        downloadFile(dataStr, fileName, mimeType);
        
    } else if (format === 'csv') {
        // Convert to CSV
        const headers = ['Task Name', 'Category', 'Start Time', 'Duration', 'Priority'];
        const rows = state.routineTasks.map(task => [
            `"${task.name}"`,
            `"${task.category}"`,
            `"${formatTime(task.startTime)}"`,
            `"${task.duration} min"`,
            `"${task.priority}"`
        ]);
        
        dataStr = [headers, ...rows].map(row => row.join(',')).join('\n');
        fileName = 'routine.csv';
        mimeType = 'text/csv';
        
        downloadFile(dataStr, fileName, mimeType);
        
    } else if (format === 'pdf') {
        // Call the enhanced PDF export function
        showExportModal();
    }
}

function exportSingleRoutine(routineId) {
    const routine = state.savedRoutines.find(r => r.id === routineId);
    if (!routine) return;
    
    const dataStr = JSON.stringify(routine, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${routine.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Routine exported successfully!');
}

function addCustomTask() {
    const name = customTaskName.value.trim();
    const category = customTaskCategory.value;
    
    if (!name) {
        alert('Please enter a task name');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        name,
        category,
        duration: 30,
        color: '#6b7280',
        priority: 'medium'
    };
    
    state.taskLibrary.push(newTask);
    renderTaskLibrary();
    selectTask(newTask);
    
    // Reset form
    customTaskName.value = '';
    customTaskCategory.value = 'custom';
    
    showToast('Custom task added to library!');
    saveToLocalStorage();
}

function renderAnalyticsCharts() {
    // Completion Chart (Line Chart)
    const completionCtx = document.getElementById('completion-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.completionChart) {
        window.completionChart.destroy();
    }
    
    window.completionChart = new Chart(completionCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Completion Rate (%)',
                data: state.analyticsData.completion,
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
    
    // Distribution Chart (Doughnut Chart)
    const distributionCtx = document.getElementById('distribution-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.distributionChart) {
        window.distributionChart.destroy();
    }
    
    const categoryColors = {
        morning: '#f59e0b',
        work: '#3b82f6',
        fitness: '#10b981',
        evening: '#8b5cf6'
    };
    
    const labels = Object.keys(state.analyticsData.distribution);
    const data = Object.values(state.analyticsData.distribution);
    const backgroundColors = labels.map(label => categoryColors[label] || '#6b7280');
    
    window.distributionChart = new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
            labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Update stats
    const avgCompletion = state.analyticsData.completion.reduce((a, b) => a + b, 0) / state.analyticsData.completion.length;
    document.getElementById('avg-completion').textContent = `${Math.round(avgCompletion)}%`;
    
    const totalHours = state.routineTasks.reduce((sum, task) => sum + task.duration, 0) / 60;
    document.getElementById('total-hours').textContent = `${Math.round(totalHours)}h`;
    
    document.getElementById('consistency-streak').textContent = `${state.analyticsData.completion.filter(c => c >= 70).length}`;
    
    const trend = state.analyticsData.completion[6] - state.analyticsData.completion[0];
    document.getElementById('productivity-trend').textContent = `${trend > 0 ? '+' : ''}${trend}%`;
}

function formatTime(decimalTime) {
    const hour = Math.floor(decimalTime);
    const minute = Math.round((decimalTime - hour) * 60);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
}

function showToast(message) {
    const toastMessage = toast.querySelector('.toast-message');
    toastMessage.textContent = message;
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function saveToLocalStorage() {
    const appData = {
        routineTasks: state.routineTasks,
        savedRoutines: state.savedRoutines,
        taskLibrary: state.taskLibrary
    };
    
    localStorage.setItem('flowRoutineData', JSON.stringify(appData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('flowRoutineData');
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            if (data.routineTasks) state.routineTasks = data.routineTasks;
            if (data.savedRoutines) state.savedRoutines = data.savedRoutines;
            if (data.taskLibrary) state.taskLibrary = data.taskLibrary;
            
            // Update UI
            renderRoutineTasks();
            renderTaskLibrary();
            renderSavedRoutines();
            updateRoutineSummary();
            
            showToast('Data loaded from local storage!');
        } catch (e) {
            console.error('Error loading saved data:', e);
        }
    }
}

function handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (importedData.routineTasks) {
                state.routineTasks = importedData.routineTasks;
                renderRoutineTasks();
                updateRoutineSummary();
            }
            
            if (importedData.savedRoutines) {
                state.savedRoutines = importedData.savedRoutines;
                renderSavedRoutines();
            }
            
            if (importedData.taskLibrary) {
                state.taskLibrary = importedData.taskLibrary;
                renderTaskLibrary();
            }
            
            saveToLocalStorage();
            showToast('Data imported successfully!');
            
            // Reset file input
            event.target.value = '';
        } catch (error) {
            alert('Error importing file. Please make sure it\'s a valid JSON file.');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
}

// ==================== PDF EXPORT FUNCTIONS ====================

function showExportModal() {
    if (state.routineTasks.length === 0) {
        alert('Your routine is empty. Add some tasks before exporting.');
        return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3><i class="fas fa-file-export"></i> Export PDF Report</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin: 20px 0;">
                    <i class="fas fa-file-pdf" style="font-size: 48px; color: #e74c3c; margin-bottom: 15px;"></i>
                    <h4>Create a beautiful PDF report</h4>
                    <p style="color: #6b7280; margin-bottom: 20px;">Customize your routine report before generating.</p>
                    
                    <div class="form-group">
                        <label for="pdf-title">Report Title</label>
                        <input type="text" id="pdf-title" value="My Daily Routine" placeholder="Enter report title">
                    </div>
                    
                    <div class="form-group">
                        <label for="pdf-author">Author Name (Optional)</label>
                        <input type="text" id="pdf-author" placeholder="Your name">
                    </div>
                    
                    <div class="form-group">
                        <label style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="include-stats" checked>
                            Include productivity statistics
                        </label>
                        <label style="display: flex; align-items: center; gap: 10px; margin-top: 10px;">
                            <input type="checkbox" id="include-tips" checked>
                            Include productivity tips
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary modal-cancel">Cancel</button>
                <button class="btn-primary" id="generate-pdf">
                    <i class="fas fa-download"></i> Generate PDF
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.modal-cancel').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('#generate-pdf').addEventListener('click', () => {
        const title = document.getElementById('pdf-title').value;
        const author = document.getElementById('pdf-author').value;
        const includeStats = document.getElementById('include-stats').checked;
        const includeTips = document.getElementById('include-tips').checked;
        
        // Enhanced PDF export with options - FIXED
        exportEnhancedPDF(title, author, includeStats, includeTips);
        document.body.removeChild(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

function exportEnhancedPDF(title = 'My Daily Routine', author = '', includeStats = true, includeTips = true) {
    showToast('Generating PDF report...');
    
    // Create PDF content container
    const pdfContainer = document.createElement('div');
    pdfContainer.style.cssText = `
        position: fixed;
        top: -9999px;
        left: -9999px;
        width: 800px;
        background: white;
        color: black;
        padding: 40px;
        font-family: 'Inter', sans-serif;
        line-height: 1.6;
    `;
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Calculate statistics
    const stats = calculateRoutineStats();
    
    // Build PDF content - FIXED to prevent duplication
    let pdfHTML = `
        <div id="pdf-content" style="max-width: 800px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #4f46e5;">
                <h1 style="color: #4f46e5; margin-bottom: 10px; font-size: 36px;">📅 FlowRoutine</h1>
                <h2 style="color: #1f2937; margin-bottom: 10px; font-size: 24px;">${title}</h2>
                <p style="color: #6b7280; font-size: 16px;">Generated on ${dateStr}</p>
                ${author ? `<p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Prepared by: ${author}</p>` : ''}
            </div>
            
            <!-- Quick Stats -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 25px; border-radius: 12px; margin-bottom: 30px;">
                <h3 style="margin-bottom: 20px; font-size: 20px; text-align: center;">
                    <i class="fas fa-chart-line"></i> Routine Overview
                </h3>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; text-align: center;">
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${stats.totalTasks}</div>
                        <div style="font-size: 14px; opacity: 0.9;">Total Tasks</div>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${stats.totalHours}h</div>
                        <div style="font-size: 14px; opacity: 0.9;">Total Hours</div>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${stats.productivityScore}%</div>
                        <div style="font-size: 14px; opacity: 0.9;">Productivity</div>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: bold;">${stats.highPriority}</div>
                        <div style="font-size: 14px; opacity: 0.9;">High Priority</div>
                    </div>
                </div>
            </div>
            
            <!-- Box Table Schedule -->
            <div style="margin-bottom: 40px;">
                <h3 style="color: #1f2937; border-left: 4px solid #4f46e5; padding-left: 15px; 
                          margin-bottom: 20px; font-size: 22px;">
                    <i class="fas fa-calendar-alt"></i> Daily Schedule (Box Table Format)
                </h3>
                ${generateBoxTableSchedule()}
            </div>
    `;
    
    // Add statistics if enabled
    if (includeStats) {
        pdfHTML += `
            <!-- Statistics Section -->
            <div style="margin-bottom: 40px;">
                <h3 style="color: #1f2937; border-left: 4px solid #10b981; padding-left: 15px; 
                          margin-bottom: 20px; font-size: 22px;">
                    <i class="fas fa-chart-bar"></i> Detailed Statistics
                </h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                    <!-- Category Distribution -->
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                        <h4 style="margin-bottom: 15px; color: #1f2937;">Category Distribution</h4>
                        ${generateCategoryStats()}
                    </div>
                    
                    <!-- Time Distribution -->
                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
                        <h4 style="margin-bottom: 15px; color: #1f2937;">Time Distribution</h4>
                        ${generateTimeStats()}
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add productivity tips if enabled
    if (includeTips) {
        pdfHTML += `
            <!-- Productivity Tips -->
            <div style="background: #f0f9ff; border: 1px solid #e0f2fe; border-radius: 8px; 
                      padding: 25px; margin-bottom: 40px;">
                <h3 style="color: #0369a1; margin-bottom: 15px; font-size: 22px;">
                    <i class="fas fa-lightbulb"></i> Productivity Tips
                </h3>
                <div style="display: grid; gap: 10px;">
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <div style="color: #10b981; font-size: 18px;">✓</div>
                        <div><strong>Batch similar tasks</strong> to reduce context switching</div>
                    </div>
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <div style="color: #10b981; font-size: 18px;">✓</div>
                        <div><strong>Schedule breaks</strong> every 90 minutes for optimal focus</div>
                    </div>
                    <div style="display: flex; align-items: flex-start; gap: 10px;">
                        <div style="color: #10b981; font-size: 18px;">✓</div>
                        <div><strong>Review and adjust</strong> your routine weekly for continuous improvement</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Footer
    pdfHTML += `
            <!-- Footer -->
            <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; 
                      color: #6b7280; font-size: 12px; text-align: center;">
                <p>Generated by FlowRoutine • https://flowroutine.vercel.app</p>
                <p>For personal use only. Track your progress and build better habits.</p>
            </div>
        </div>
    `;
    
    pdfContainer.innerHTML = pdfHTML;
    document.body.appendChild(pdfContainer);
    
    // Generate PDF
    html2canvas(pdfContainer.querySelector('#pdf-content'), {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            hotfixes: ["px_scaling"]
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margins on each side
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        
        // Save PDF with timestamp
        const timestamp = now.toISOString().replace(/[:.]/g, '-');
        pdf.save(`FlowRoutine_${timestamp}.pdf`);
        
        // Clean up
        document.body.removeChild(pdfContainer);
        
        showToast('PDF report generated successfully!');
    }).catch(error => {
        console.error('PDF generation error:', error);
        document.body.removeChild(pdfContainer);
        alert('Error generating PDF. Please try a different export format.');
    });
}

function calculateRoutineStats() {
    const totalTasks = state.routineTasks.length;
    const totalMinutes = state.routineTasks.reduce((sum, task) => sum + task.duration, 0);
    const highPriority = state.routineTasks.filter(task => task.priority === 'high').length;
    const productivityScore = totalTasks > 0 ? Math.round((highPriority / totalTasks) * 100) : 0;
    
    return {
        totalTasks,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        totalMinutes,
        highPriority,
        productivityScore
    };
}

// NEW: Generate Box Table Schedule for PDF
function generateBoxTableSchedule() {
    const sortedTasks = [...state.routineTasks].sort((a, b) => a.startTime - b.startTime);
    
    if (sortedTasks.length === 0) return '<p style="color: #6b7280; text-align: center;">No tasks scheduled</p>';
    
    // Create time blocks from 6 AM to 10 PM
    const timeBlocks = [];
    for (let hour = 6; hour < 22; hour++) {
        for (let quarter = 0; quarter < 4; quarter++) {
            timeBlocks.push({
                hour: hour,
                minute: quarter * 15,
                time: hour + (quarter * 0.25)
            });
        }
    }
    
    // Create schedule grid
    let scheduleHTML = `
        <div style="display: grid; grid-template-columns: 100px repeat(${timeBlocks.length}, 1fr); 
                    border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <!-- Time labels column -->
            <div style="grid-column: 1; background: #f8fafc; border-right: 1px solid #e5e7eb;">
                <div style="height: 40px; display: flex; align-items: center; justify-content: center; 
                          font-weight: bold; border-bottom: 1px solid #e5e7eb;">
                    Time
                </div>
    `;
    
    // Add time labels
    for (let hour = 6; hour <= 22; hour++) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        
        scheduleHTML += `
            <div style="height: 60px; display: flex; align-items: center; justify-content: center; 
                      border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                ${displayHour}:00 ${period}
            </div>
        `;
    }
    
    scheduleHTML += `</div>`;
    
    // Create time grid columns
    scheduleHTML += `<div style="grid-column: 2 / span ${timeBlocks.length};">`;
    
    // Create horizontal time grid
    for (let hour = 6; hour <= 22; hour++) {
        scheduleHTML += `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); height: 60px; 
                      border-bottom: 1px solid #e5e7eb;">
        `;
        
        for (let quarter = 0; quarter < 4; quarter++) {
            const timeValue = hour + (quarter * 0.25);
            scheduleHTML += `
                <div style="border-right: 1px solid #f1f5f9; position: relative;">
                    <!-- Quarter hour markers -->
                    ${quarter === 0 ? `
                        <div style="position: absolute; top: 0; left: 0; right: 0; height: 1px; 
                                  background: #e5e7eb;"></div>
                    ` : ''}
                </div>
            `;
        }
        
        scheduleHTML += `</div>`;
    }
    
    scheduleHTML += `</div>`;
    
    // Add task boxes on top of the grid
    scheduleHTML += `<div style="grid-column: 2 / span ${timeBlocks.length}; grid-row: 1; position: relative; margin-top: 40px;">`;
    
    sortedTasks.forEach((task, index) => {
        const startTime = task.startTime;
        const endTime = startTime + (task.duration / 60);
        
        // Calculate position and size
        const startColumn = ((startTime - 6) * 4) + 1; // Each hour = 4 columns (15 min each)
        const durationInColumns = (task.duration / 15); // Duration in 15-min increments
        const rowHeight = 60; // Each hour row height
        
        scheduleHTML += `
            <div style="position: absolute; 
                      left: calc(${startColumn - 1} * (100% / ${timeBlocks.length}));
                      width: calc(${durationInColumns} * (100% / ${timeBlocks.length}));
                      top: ${(startTime - 6) * rowHeight}px;
                      height: ${(task.duration / 60) * rowHeight}px;
                      background: ${task.color};
                      border-radius: 4px;
                      color: white;
                      padding: 8px;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                      border-left: 4px solid ${getDarkerColor(task.color)};
                      overflow: hidden;
                      z-index: 2;">
                <div style="font-weight: bold; font-size: 12px; margin-bottom: 2px;">${task.name}</div>
                <div style="font-size: 10px; opacity: 0.9;">
                    ${formatTime(startTime)} - ${formatTime(endTime)}
                </div>
                <div style="font-size: 10px; display: flex; justify-content: space-between; margin-top: 4px;">
                    <span>${task.duration} min</span>
                    <span style="text-transform: capitalize;">${task.category}</span>
                </div>
            </div>
        `;
    });
    
    scheduleHTML += `</div></div>`;
    
    // Also add a simple table version for clarity
    scheduleHTML += `
        <div style="margin-top: 40px;">
            <h4 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">
                <i class="fas fa-list"></i> Task List
            </h4>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <thead>
                    <tr style="background: #4f46e5; color: white;">
                        <th style="padding: 12px; text-align: left;">Time</th>
                        <th style="padding: 12px; text-align: left;">Task</th>
                        <th style="padding: 12px; text-align: left;">Duration</th>
                        <th style="padding: 12px; text-align: left;">Priority</th>
                        <th style="padding: 12px; text-align: left;">Category</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedTasks.map((task, index) => `
                        <tr style="${index % 2 === 0 ? 'background: #f9fafb;' : 'background: white;'} border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 12px; font-weight: 600; color: #1f2937;">
                                ${formatTime(task.startTime)} - ${formatTime(task.startTime + task.duration/60)}
                            </td>
                            <td style="padding: 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <div style="width: 12px; height: 12px; border-radius: 2px; background: ${task.color};"></div>
                                    <div>${task.name}</div>
                                </div>
                            </td>
                            <td style="padding: 12px; color: #6b7280;">
                                ${task.duration} minutes
                            </td>
                            <td style="padding: 12px;">
                                <span style="display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 500;
                                      background: ${getPriorityColor(task.priority, 'bg')};
                                      color: ${getPriorityColor(task.priority, 'text')};">
                                    ${task.priority.toUpperCase()}
                                </span>
                            </td>
                            <td style="padding: 12px; text-transform: capitalize;">
                                ${task.category}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    return scheduleHTML;
}

function getDarkerColor(hex) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // Darken by 20%
    r = Math.floor(r * 0.8);
    g = Math.floor(g * 0.8);
    b = Math.floor(b * 0.8);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getPriorityColor(priority, type = 'bg') {
    const colors = {
        high: { bg: '#fee2e2', text: '#991b1b' },
        medium: { bg: '#fef3c7', text: '#92400e' },
        low: { bg: '#dcfce7', text: '#166534' }
    };
    return colors[priority]?.[type] || (type === 'bg' ? '#e5e7eb' : '#6b7280');
}

function generateCategoryStats() {
    const categories = {};
    state.routineTasks.forEach(task => {
        categories[task.category] = (categories[task.category] || 0) + 1;
    });
    
    const categoryColors = {
        morning: '#f59e0b',
        work: '#3b82f6',
        fitness: '#10b981',
        evening: '#8b5cf6',
        custom: '#6b7280'
    };
    
    const totalTasks = state.routineTasks.length;
    
    return Object.entries(categories).map(([category, count]) => {
        const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
        return `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span style="font-weight: 500; text-transform: capitalize;">${category}</span>
                    <span>${count} task${count !== 1 ? 's' : ''} (${percentage}%)</span>
                </div>
                <div style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: ${categoryColors[category] || '#6b7280'};"></div>
                </div>
            </div>
        `;
    }).join('');
}

function generateTimeStats() {
    const timeSlots = {
        morning: { start: 5, end: 12 },    // 5 AM - 12 PM
        afternoon: { start: 12, end: 17 },  // 12 PM - 5 PM
        evening: { start: 17, end: 21 },    // 5 PM - 9 PM
        night: { start: 21, end: 5 }        // 9 PM - 5 AM
    };
    
    const slotCounts = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
    };
    
    state.routineTasks.forEach(task => {
        const taskStart = task.startTime;
        
        // Check which time slot the task falls into
        if (taskStart >= 5 && taskStart < 12) slotCounts.morning++;
        else if (taskStart >= 12 && taskStart < 17) slotCounts.afternoon++;
        else if (taskStart >= 17 && taskStart < 21) slotCounts.evening++;
        else slotCounts.night++;
    });
    
    const totalTasks = state.routineTasks.length;
    
    return Object.entries(slotCounts).map(([slot, count]) => {
        const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
        const slotNames = {
            morning: '🌅 Morning (5 AM - 12 PM)',
            afternoon: '☀️ Afternoon (12 PM - 5 PM)',
            evening: '🌆 Evening (5 PM - 9 PM)',
            night: '🌙 Night (9 PM - 5 AM)'
        };
        
        return `
            <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span>${slotNames[slot] || slot}</span>
                    <span>${count} task${count !== 1 ? 's' : ''}</span>
                </div>
                <div style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${percentage}%; height: 100%; background: #8b5cf6;"></div>
                </div>
            </div>
        `;
    }).join('');
}

function downloadFile(dataStr, fileName, mimeType) {
    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Routine exported as ${fileName}!`);
}