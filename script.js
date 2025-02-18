let tasks = {
  high: [],
  medium: [],
  low: []
};

let completedTasks = [];
let timer;
let startTime;
let selectedTask = null;
let isTimerRunning = false;

function addTask() {
  const taskInput = document.getElementById('taskInput');
  const prioritySelect = document.getElementById('prioritySelect');
  
  if (taskInput.value.trim() === '') return;
  
  const task = {
    id: Date.now(),
    name: taskInput.value,
    priority: prioritySelect.value
  };
  
  tasks[task.priority].push(task);
  updateTaskLists();
  
  taskInput.value = '';
}

function updateTaskLists() {
  ['high', 'medium', 'low'].forEach(priority => {
    const list = document.getElementById(`${priority}Priority`);
    list.innerHTML = '';
    
    tasks[priority].forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.name;
      li.onclick = () => selectTask(task);
      list.appendChild(li);
    });
  });
}

function selectTask(task) {
  if (isTimerRunning) return;
  
  selectedTask = task;
  document.getElementById('currentTask').textContent = task.name;
  document.getElementById('timer').textContent = '00:00:00';
}

function startTimer() {
  if (!selectedTask || isTimerRunning) return;
  
  isTimerRunning = true;
  startTime = Date.now();
  
  timer = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    document.getElementById('timer').textContent = formatTime(elapsedTime);
  }, 1000);
  
  document.getElementById('startTimer').disabled = true;
}

function completeTask() {
  if (!selectedTask || !isTimerRunning) return;
  
  clearInterval(timer);
  const endTime = Date.now();
  const timeSpent = endTime - startTime;
  
  const completedTask = {
    name: selectedTask.name,
    priority: selectedTask.priority,
    timeSpent: formatTime(timeSpent)
  };
  
  completedTasks.push(completedTask);
  
  // Remove task from tasks list
  tasks[selectedTask.priority] = tasks[selectedTask.priority].filter(
    task => task.id !== selectedTask.id
  );
  
  updateTaskLists();
  updateCompletedList();
  
  // Reset timer and selection
  selectedTask = null;
  isTimerRunning = false;
  document.getElementById('currentTask').textContent = 'No task selected';
  document.getElementById('timer').textContent = '00:00:00';
  document.getElementById('startTimer').disabled = false;
}

function formatTime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(number) {
  return number.toString().padStart(2, '0');
}

function updateCompletedList() {
  const completedList = document.getElementById('completedList');
  completedList.innerHTML = '';
  
  completedTasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = `${task.name} (${task.priority} priority) - Time spent: ${task.timeSpent}`;
    completedList.appendChild(li);
  });
}

function downloadCompletedTasks() {
  if (completedTasks.length === 0) {
    alert('No completed tasks to download!');
    return;
  }
  
  let fileContent = 'Completed Tasks Report\n\n';
  completedTasks.forEach(task => {
    fileContent += `Task: ${task.name}\n`;
    fileContent += `Priority: ${task.priority}\n`;
    fileContent += `Time spent: ${task.timeSpent}\n`;
    fileContent += '-------------------\n';
  });
  
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'completed_tasks.txt';
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}