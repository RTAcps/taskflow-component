import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskStatus } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-kanban-board',
    standalone: true,
    imports: [ CommonModule ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="kanban-board">
            <div class="header-container">
                <button class="back-button" (click)="goBack()">
                    ← Voltar
                </button>
                <h2>Kanban Board - Projeto {{ projectId }}</h2>
            </div>
            
            <div class="kanban-columns">
                <div *ngFor="let status of taskStatusList" class="kanban-column">
                    <h3>{{ getStatusLabel(status) }}</h3>
                    <div class="task-list">
                        <div *ngFor="let task of getTasksForStatus(status)" class="task-card">
                            <h4>{{ task.title }}</h4>
                            <p>{{ task.description }}</p>
                            <div class="task-meta">
                                <span class="priority">{{ task.priority }}</span>
                                <span *ngIf="task.assignee" class="assignee">
                                    {{ task.assignee.name }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
            --primary-color: #3B82F6;
            --primary-700: #0c61e4;
        }
        .kanban-board {
            padding: 20px;
        }
        .header-container {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .back-button {
            background-color: var(--primary-color, #3B82F6);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            margin-right: 16px;
            cursor: pointer;
            display: flex;
            align-items: center;
        }
        .back-button:hover {
            background-color: var(--primary-700, #0c61e4);
        }
        .kanban-columns {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .kanban-column {
            background: #f5f5f5;
            border-radius: 8px;
            padding: 16px;
        }
        .kanban-column h3 {
            margin: 0 0 16px 0;
            padding: 8px;
            background: #e0e0e0;
            border-radius: 4px;
            text-align: center;
        }
        .task-list {
            min-height: 200px;
        }
        .task-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
        }
        .task-meta {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
            margin-top: 8px;
        }
        .priority {
            padding: 2px 6px;
            border-radius: 4px;
            background: #ffeb3b;
        }
        .assignee {
            font-weight: 500;
        }
    `]
})
export class KanbanBoardComponent implements OnInit {
    @Input() projectId!: string;
    private readonly destroy$ = new Subject<void>();
    
    tasksByStatus: { [key in TaskStatus]: Task[] } = {
        [TaskStatus.BACKLOG]: [],
        [TaskStatus.TODO]: [],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.REVIEW]: [],
        [TaskStatus.DONE]: []
    };
    
    taskStatusList = Object.values(TaskStatus);

    constructor(
        private readonly projectService: ProjectService,
        private readonly router: Router
    ) {}

    ngOnInit() {
        if (this.projectId) {
            this.loadTasks();
        }
    }
    
    goBack() {
        const isInsideShell = window.location.port !== '4201';
        
        if (isInsideShell) {
            this.router.navigate(['/project-management']);
        } else {
            this.router.navigate(['/projects']);
        }
    }

    private loadTasks() {
        // Carregamos as tarefas do projeto e organizamos por status
        this.projectService.getProjectById(this.projectId)
            .pipe(takeUntil(this.destroy$))
            .subscribe(project => {
                if (project) {
                    this.organizeTasksByStatus(project.tasks);
                }
            });
    }

    private organizeTasksByStatus(tasks: Task[]) {
        // Reset all arrays
        Object.keys(this.tasksByStatus).forEach(status => {
            this.tasksByStatus[status as TaskStatus] = [];
        });

        // Organize tasks by status
        tasks.forEach(task => {
            this.tasksByStatus[task.status].push(task);
        });
    }

    getTasksForStatus(status: TaskStatus): Task[] {
        return this.tasksByStatus[status] || [];
    }

    getStatusLabel(status: TaskStatus): string {
        const labels: { [key in TaskStatus]: string } = {
            [TaskStatus.BACKLOG]: 'Backlog',
            [TaskStatus.TODO]: 'Para Fazer',
            [TaskStatus.IN_PROGRESS]: 'Em Progresso',
            [TaskStatus.REVIEW]: 'Em Revisão',
            [TaskStatus.DONE]: 'Concluído'
        };
        return labels[status];
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
