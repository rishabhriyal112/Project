document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addBtn = document.getElementById('addBtn');
    const taskList = document.getElementById('taskList');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    function init() {
        renderTasks();
        updateTaskCount();
        setupEventListeners();
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Add new task
        addBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTask();
        });
        
        // Filter tasks
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentFilter = button.dataset.filter;
                renderTasks();
            });
        });
        
        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', clearCompleted);
    }
    
    // Add a new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text !== '') {
            const newTask = {
                id: Date.now(),
                text,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            tasks.unshift(newTask);
            saveTasks();
            renderTasks();
            updateTaskCount();
            taskInput.value = '';
            taskInput.focus();
        }
    }
    
    // Render tasks based on current filter
    function renderTasks() {
        // Filter tasks
        const filteredTasks = tasks.filter(task => {
            if (currentFilter === 'active') return !task.completed;
            if (currentFilter === 'completed') return task.completed;
            return true; // 'all'
        });
        
        // Clear the task list
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'No tasks found';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = '#888';
            emptyMessage.style.padding = '1rem';
            taskList.appendChild(emptyMessage);
            return;
        }
        
        // Add tasks to the list
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item' + (task.completed ? ' completed' : '');
            li.dataset.id = task.id;
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            // Toggle task completion
            const checkbox = li.querySelector('.task-checkbox');
            checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, checkbox.checked));
            
            // Delete task
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTask(task.id);
            });
            
            taskList.appendChild(li);
        });
    }
    
    // Toggle task completion status
    function toggleTaskCompletion(taskId, isCompleted) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = isCompleted;
            saveTasks();
            updateTaskCount();
            renderTasks();
        }
    }
    
    // Delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        updateTaskCount();
        renderTasks();
    }
    
    // Clear completed tasks
    function clearCompleted() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        updateTaskCount();
        renderTasks();
    }
    
    // Update the task counter
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // Initialize the app
    init();
});
