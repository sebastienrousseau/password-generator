// Copyright © 2022-2024 Password Generator. All rights reserved.
// SPDX-License-Identifier: Apache-2.0 OR MIT

/**
 * Password Worker Pool
 *
 * Manages a pool of Web Workers for parallel password generation.
 * Provides load balancing, error handling, and progress tracking.
 *
 * @module workers/password-worker-pool
 */

/**
 * Manages a pool of password generation workers for parallel processing.
 */
export class PasswordWorkerPool {
  /**
   * Creates a new worker pool.
   *
   * @param {Object} options - Pool configuration options.
   * @param {number} [options.size=navigator.hardwareConcurrency || 4] - Number of workers to spawn.
   * @param {string} [options.workerScript] - Path to the worker script.
   * @param {number} [options.maxRetries=3] - Maximum number of retries per task.
   * @param {number} [options.timeout=30000] - Task timeout in milliseconds.
   */
  constructor(options = {}) {
    const {
      size = navigator?.hardwareConcurrency || 4,
      workerScript = new URL("./password-worker.js", import.meta.url).href,
      maxRetries = 3,
      timeout = 30000,
    } = options;

    this.size = size;
    this.workerScript = workerScript;
    this.maxRetries = maxRetries;
    this.timeout = timeout;

    this.workers = [];
    this.taskQueue = [];
    this.activeTasks = new Map();
    this.nextTaskId = 1;
    this.isInitialized = false;
    this.isTerminated = false;

    // Statistics
    this.stats = {
      tasksCompleted: 0,
      tasksQueued: 0,
      totalPasswordsGenerated: 0,
      averageTaskTime: 0,
      errors: 0,
    };
  }

  /**
   * Initializes the worker pool.
   *
   * @returns {Promise<void>} Resolves when all workers are ready.
   */
  async initialize() {
    if (this.isInitialized || this.isTerminated) {
      return;
    }

    const workerPromises = [];

    for (let i = 0; i < this.size; i++) {
      const workerPromise = this._createWorker();
      workerPromises.push(workerPromise);
    }

    this.workers = await Promise.all(workerPromises);
    this.isInitialized = true;
  }

  /**
   * Creates a single worker and waits for it to be ready.
   *
   * @returns {Promise<Object>} Worker instance with metadata.
   * @private
   */
  async _createWorker() {
    return new Promise((resolve, reject) => {
      const worker = new Worker(this.workerScript, { type: "module" });

      const workerData = {
        worker,
        busy: false,
        tasksCompleted: 0,
        id: this.workers.length,
      };

      let onReady, onError;

      onError = (error) => {
        worker.removeEventListener("message", onReady);
        worker.removeEventListener("error", onError);
        reject(new Error(`Worker failed to initialize: ${error.message}`));
      };

      onReady = (event) => {
        if (event.data.type === "ready") {
          worker.removeEventListener("message", onReady);
          worker.removeEventListener("error", onError);
          resolve(workerData);
        }
      };

      worker.addEventListener("message", onReady);
      worker.addEventListener("error", onError);

      // Handle worker messages
      worker.addEventListener("message", (event) => {
        this._handleWorkerMessage(workerData, event);
      });

      worker.addEventListener("error", (error) => {
        this._handleWorkerError(workerData, error);
      });
    });
  }

  /**
   * Handles messages from workers.
   *
   * @param {Object} workerData - Worker metadata.
   * @param {MessageEvent} event - Message event from worker.
   * @private
   */
  _handleWorkerMessage(workerData, event) {
    const data = event.data;

    if (data.type === "progress") {
      // Forward progress events
      const task = this.activeTasks.get(data.id);
      if (task && task.onProgress) {
        task.onProgress(data);
      }
      return;
    }

    const task = this.activeTasks.get(data.id);
    if (!task) {
      return;
    }

    clearTimeout(task.timeoutId);
    this.activeTasks.delete(data.id);
    workerData.busy = false;
    workerData.tasksCompleted++;

    if (data.success) {
      this.stats.tasksCompleted++;
      this.stats.totalPasswordsGenerated += Array.isArray(data.result) ? data.result.length : 1;
      task.resolve(data.result);
    } else {
      this.stats.errors++;
      if (task.retries < this.maxRetries) {
        task.retries++;
        this.taskQueue.unshift(task); // Retry immediately
      } else {
        task.reject(new Error(data.error));
      }
    }

    // Process next task in queue
    this._processQueue();
  }

  /**
   * Handles worker errors.
   *
   * @param {Object} workerData - Worker metadata.
   * @param {ErrorEvent} error - Error event from worker.
   * @private
   */
  _handleWorkerError(workerData, error) {
    console.error(`Worker ${workerData.id} error:`, error);
    this.stats.errors++;

    // Mark all tasks assigned to this worker as failed
    for (const [taskId, task] of this.activeTasks.entries()) {
      if (task.workerId === workerData.id) {
        clearTimeout(task.timeoutId);
        this.activeTasks.delete(taskId);
        task.reject(new Error(`Worker error: ${error.message}`));
      }
    }

    workerData.busy = false;
  }

  /**
   * Processes the task queue and assigns work to available workers.
   *
   * @private
   */
  _processQueue() {
    while (this.taskQueue.length > 0) {
      const availableWorker = this.workers.find((w) => !w.busy);
      if (!availableWorker) {
        break;
      }

      const task = this.taskQueue.shift();
      this._executeTask(availableWorker, task);
    }
  }

  /**
   * Executes a task on a specific worker.
   *
   * @param {Object} workerData - Worker to execute task on.
   * @param {Object} task - Task to execute.
   * @private
   */
  _executeTask(workerData, task) {
    workerData.busy = true;
    task.workerId = workerData.id;

    // Set timeout
    task.timeoutId = setTimeout(() => {
      this.activeTasks.delete(task.id);
      workerData.busy = false;
      task.reject(new Error("Task timeout"));
    }, this.timeout);

    this.activeTasks.set(task.id, task);
    workerData.worker.postMessage({
      id: task.id,
      action: task.action,
      payload: task.payload,
    });
  }

  /**
   * Generates a single password using an available worker.
   *
   * @param {Object} config - Password generation configuration.
   * @returns {Promise<string>} Generated password.
   */
  async generatePassword(config) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this._queueTask("generate", { config });
  }

  /**
   * Generates multiple passwords in parallel across all workers.
   *
   * @param {Array<Object>} configs - Array of password configurations.
   * @param {Object} [options] - Generation options.
   * @param {Function} [options.onProgress] - Progress callback.
   * @param {number} [options.batchSize] - Size of batches sent to each worker.
   * @returns {Promise<Array<string>>} Array of generated passwords.
   */
  async generateMultiple(configs, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { onProgress, batchSize = Math.ceil(configs.length / this.size) } = options;

    // Split configs into batches for parallel processing
    const batches = [];
    for (let i = 0; i < configs.length; i += batchSize) {
      batches.push(configs.slice(i, i + batchSize));
    }

    let completedCount = 0;
    const totalCount = configs.length;

    // Create tasks for each batch
    const batchTasks = batches.map((batch, index) => {
      return this._queueTask(
        "generateBatch",
        {
          configs: batch,
          batchId: index,
        },
        {
          onProgress: (progressData) => {
            completedCount =
              batches.slice(0, index).reduce((sum, b) => sum + b.length, 0) +
              progressData.completed;
            if (onProgress) {
              onProgress({
                completed: completedCount,
                total: totalCount,
                percentage: Math.round((completedCount / totalCount) * 100),
              });
            }
          },
        }
      );
    });

    // Wait for all batches to complete
    const batchResults = await Promise.all(batchTasks);

    // Flatten results maintaining order
    return batchResults.flat();
  }

  /**
   * Validates a password configuration using a worker.
   *
   * @param {Object} config - Configuration to validate.
   * @returns {Promise<Object>} Validation result.
   */
  async validateConfig(config) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this._queueTask("validateConfig", { config });
  }

  /**
   * Calculates entropy for a password configuration using a worker.
   *
   * @param {Object} config - Configuration to analyze.
   * @returns {Promise<Object>} Entropy calculation result.
   */
  async calculateEntropy(config) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this._queueTask("calculateEntropy", { config });
  }

  /**
   * Gets supported password types from a worker.
   *
   * @returns {Promise<Array<string>>} Array of supported types.
   */
  async getSupportedTypes() {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this._queueTask("getSupportedTypes", {});
  }

  /**
   * Queues a task for execution.
   *
   * @param {string} action - Action to perform.
   * @param {Object} payload - Task payload.
   * @param {Object} [options] - Task options.
   * @returns {Promise} Promise that resolves with task result.
   * @private
   */
  _queueTask(action, payload, options = {}) {
    if (this.isTerminated) {
      return Promise.reject(new Error("Worker pool has been terminated"));
    }

    return new Promise((resolve, reject) => {
      const task = {
        id: this.nextTaskId++,
        action,
        payload,
        resolve,
        reject,
        retries: 0,
        createdAt: Date.now(),
        onProgress: options.onProgress,
      };

      this.stats.tasksQueued++;
      this.taskQueue.push(task);
      this._processQueue();
    });
  }

  /**
   * Gets current pool statistics.
   *
   * @returns {Object} Pool statistics.
   */
  getStats() {
    return {
      ...this.stats,
      poolSize: this.size,
      activeWorkers: this.workers.filter((w) => w.busy).length,
      queueLength: this.taskQueue.length,
      activeTasks: this.activeTasks.size,
    };
  }

  /**
   * Terminates all workers and cleans up resources.
   *
   * @returns {Promise<void>} Resolves when all workers are terminated.
   */
  async terminate() {
    if (this.isTerminated) {
      return;
    }

    this.isTerminated = true;

    // Cancel all pending tasks
    for (const task of this.taskQueue) {
      task.reject(new Error("Worker pool terminated"));
    }
    this.taskQueue = [];

    // Cancel all active tasks
    for (const task of this.activeTasks.values()) {
      clearTimeout(task.timeoutId);
      task.reject(new Error("Worker pool terminated"));
    }
    this.activeTasks.clear();

    // Terminate all workers
    const terminationPromises = this.workers.map(async (workerData) => {
      if (workerData.worker) {
        workerData.worker.terminate();
      }
    });

    await Promise.all(terminationPromises);
    this.workers = [];
  }
}
