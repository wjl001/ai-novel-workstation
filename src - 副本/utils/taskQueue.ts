import { useEpisodeStore } from '@/store/episode';
import { ElMessage } from 'element-plus';

export type TaskType = 'storyboard' | 'synthesis';

export interface Task {
  id: string;
  episodeId: string;
  dramaTitle: string;
  episodeTitle: string;
  episodeIndex: number;
  sceneIndex?: number;
  type: TaskType;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'queued';
  progress: number;
  error?: string;
  createdAt: number;
  execute: () => Promise<void>;
}

class TaskQueueManager {
  private queue: Task[] = [];
  private activeTasks: number = 0;
  private maxConcurrency: number = 2;
  private isProcessing: boolean = false;

  constructor(maxConcurrency: number = 2) {
    this.maxConcurrency = maxConcurrency;
  }

  addTask(task: Omit<Task, 'status' | 'progress' | 'createdAt'>) {
    const newTask: Task = {
      ...task,
      status: 'queued',
      progress: 0,
      createdAt: Date.now()
    };
    
    // Avoid duplicate tasks for same episode and type
    const existing = this.queue.find(t => t.episodeId === task.episodeId && t.type === task.type);
    if (existing) {
      if (existing.status === 'failed' || existing.status === 'completed') {
        this.removeTask(existing.id);
      } else {
        return; // Task already in queue or processing
      }
    }

    this.queue.push(newTask);
    this.updateStore();
    this.processQueue();
  }

  removeTask(taskId: string) {
    const index = this.queue.findIndex(t => t.id === taskId);
    if (index > -1) {
      const task = this.queue[index];
      if (task.status === 'processing') {
        // Can't easily cancel a promise-based task, but we can decrement activeTasks
        // In a real scenario, we might need an AbortController
      }
      this.queue.splice(index, 1);
      this.updateStore();
    }
  }

  getTasks() {
    return [...this.queue];
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.activeTasks < this.maxConcurrency) {
      const nextTask = this.queue.find(t => t.status === 'queued');
      if (!nextTask) break;

      this.runTask(nextTask);
    }

    this.isProcessing = false;
  }

  private async runTask(task: Task) {
    task.status = 'processing';
    this.activeTasks++;
    this.updateStore();

    try {
      await task.execute();
      task.status = 'completed';
      task.progress = 100;
      task.error = undefined;
    } catch (error: any) {
      console.error(`Task ${task.id} failed:`, error);
      task.status = 'failed';
      task.error = error.message || '生成过程中发生未知错误';
    } finally {
      this.activeTasks--;
      this.updateStore();
      this.processQueue();
    }
  }

  private updateStore() {
    const episodeStore = useEpisodeStore();
    // We'll update the store's task list
    // This assumes we'll add a 'tasks' state to episodeStore
    if ((episodeStore as any).setTasks) {
      (episodeStore as any).setTasks(this.getTasks());
    }
  }
}

export const taskQueueManager = new TaskQueueManager(2);
