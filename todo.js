
const API_URL = "https://jsonplaceholder.typicode.com/todos";
const STORAGE_KEY = "myTodoTasks";

// Load saved tasks from browser storage
let tasks = [];

try {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    tasks = savedTasks ? JSON.parse(savedTasks) : [];
    if (!Array.isArray(tasks)) tasks = [];
} catch (error) {
    tasks = [];
}

// Save tasks in localStorage
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Show a message on the webpage
function showMessage(message) {
    document.getElementById("message").textContent = message;
}

// Safely display task text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(character) {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entities[character];
    });
}

// Update dashboard numbers
function updateStats() {
    document.getElementById("totalTasks").textContent = tasks.length;

    document.getElementById("completedTasks").textContent =
        tasks.filter(task => task.completed).length;

    document.getElementById("pendingTasks").textContent =
        tasks.filter(task => !task.completed).length;
}

// Display tasks according to search and filter
function renderTasks() {
    const list = document.getElementById("taskList");

    const search = document.getElementById("searchTask")
        .value.trim().toLowerCase();

    const filter = document.getElementById("filterTask").value;

    const visibleTasks = tasks.filter(function(task) {
        const matchesSearch = task.title.toLowerCase().includes(search);

        const matchesFilter =
            filter === "All" ||
            (filter === "Completed" && task.completed) ||
            (filter === "Pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    if (visibleTasks.length === 0) {
        list.innerHTML = "<p>No tasks found. Add a task to get started.</p>";
        updateStats();
        return;
    }

    list.innerHTML = visibleTasks.map(function(task) {
        return `
            <div class="task-card ${task.completed ? "completed" : ""}">
                <div class="task-info">
                    <h3>${escapeHTML(task.title)}</h3>

                    <span class="priority ${escapeHTML(task.priority)}">
                        ${escapeHTML(task.priority)} Priority
                    </span>

                    <p>Due date: ${escapeHTML(task.dueDate || "Not set")}</p>

                    <p>Status: ${task.completed ? "Completed" : "Pending"}</p>
                </div>

                <div class="task-actions">
                    <button class="done-btn"
                        data-action="toggle" data-id="${escapeHTML(task.id)}">
                        ${task.completed ? "Undo" : "Complete"}
                    </button>

                    <button class="delete-btn"
                        data-action="delete" data-id="${escapeHTML(task.id)}">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }).join("");

    updateStats();
}

// Load sample tasks from the API
async function loadApiTasks() {
    showMessage("Loading tasks from API...");

    try {
        const response = await fetch(API_URL + "?_limit=10");

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        // Avoid adding the same API tasks more than once
        data.forEach(function(item) {
            const alreadyExists = tasks.some(function(task) {
                return task.apiId === item.id;
            });

            if (!alreadyExists) {
                tasks.push({
                    id: "api-" + item.id,
                    apiId: item.id,
                    title: item.title,
                    dueDate: "",
                    priority: "Medium",
                    completed: item.completed
                });
            }
        });

        saveTasks();
        renderTasks();
        showMessage("API tasks loaded successfully.");

    } catch (error) {
        showMessage("Could not connect to the API. Your saved tasks are still available.");
    }
}

// Add a new task
document.getElementById("taskForm").addEventListener(
    "submit",
    async function(event) {
        event.preventDefault();

        const title = document.getElementById("taskTitle")
            .value.trim();

        const dueDate = document.getElementById("taskDate").value;
        const priority = document.getElementById("taskPriority").value;

        if (!title) {
            showMessage("Please enter a task name.");
            return;
        }

        const newTask = {
            title: title,
            completed: false,
            dueDate: dueDate,
            priority: priority
        };

        showMessage("Adding task...");

        // Try creating the task through the API
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    completed: false,
                    userId: 1
                })
            });

            if (response.ok) {
                const data = await response.json();
                newTask.apiId = data.id;
                newTask.id = "api-" + data.id;
            } else {
                newTask.id = "local-" + Date.now();
            }
        } catch (error) {
            // The task can still be saved locally
            newTask.id = "local-" + Date.now();
        }

        tasks.unshift(newTask);

        saveTasks();
        renderTasks();
        document.getElementById("taskForm").reset();

        showMessage("Task added and saved in this browser.");
    }
);

// Handle Complete, Undo and Delete buttons
document.getElementById("taskList").addEventListener(
    "click",
    async function(event) {
        const button = event.target.closest("button[data-action]");

        if (!button) return;

        const task = tasks.find(function(item) {
            return String(item.id) === button.dataset.id;
        });

        if (!task) return;

        const action = button.dataset.action;

        if (action === "toggle") {
            const newStatus = !task.completed;

            // Update the API copy if this task came from the API
            if (task.apiId !== undefined) {
                try {
                    const response = await fetch(
                        API_URL + "/" + task.apiId,
                        {
                            method: "PATCH",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                completed: newStatus
                            })
                        }
                    );

                    if (!response.ok) {
                        showMessage("API update failed; updating local copy.");
                    }
                } catch (error) {
                    showMessage("API unavailable; updating local copy.");
                }
            }

            task.completed = newStatus;
            saveTasks();
            renderTasks();
            showMessage(newStatus ? "Task completed!" : "Task marked pending.");
        }

        if (action === "delete") {
            const confirmed = confirm("Do you want to delete this task?");

            if (!confirmed) return;

            // Try deleting the API copy, if it has one
            if (task.apiId !== undefined) {
                try {
                    const response = await fetch(
                        API_URL + "/" + task.apiId,
                        { method: "DELETE" }
                    );

                    if (!response.ok) {
                        showMessage("API delete request failed; removing local copy.");
                    }
                } catch (error) {
                    showMessage("API unavailable; removing local copy.");
                }
            }

            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
            showMessage("Task deleted from your local list.");
        }
    }
);

// Search tasks while typing
document.getElementById("searchTask").addEventListener(
    "input", renderTasks
);

// Filter tasks by status
document.getElementById("filterTask").addEventListener(
    "change", renderTasks
);

// Load API tasks when requested
document.getElementById("loadApiButton").addEventListener(
    "click", loadApiTasks
);

// Start the application
async function initializeApp() {
    renderTasks();
    updateStats();

    // Fetch sample data only if no tasks have been saved yet
    if (tasks.length === 0) {
        await loadApiTasks();
    }
}

initializeApp();
