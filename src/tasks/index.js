
class TaskRunner {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
    }

    runTasks() {
        console.log(`Running ${this.tasks.length} tasks`);
        for (let n=0; n<this.tasks.length; ++n) {
            const task = this.tasks[n];
            if (task.execute) { // Make sure the function is defined before running it
                task.execute()
                    .then(result => {
                        console.log('Task result', result);
                    })
                    .catch(error => {
                        console.log('Task error', error);
                    })
            }
        }
    }
}

module.exports = TaskRunner
