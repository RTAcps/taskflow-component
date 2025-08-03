import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskStatus } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'app-kanban-board',
    imports: [ CommonModule, DragDropModule ],
    templateUrl: './kanban-board.component.html',
    styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
    @Input() projectId!: string;
    private readonly destroy$ = new Subject<void>();
    
    tasksByStatus$!: Observable<{ [key in TaskStatus]: Task[] }>;
    taskStatusList = Object.values(TaskStatus);

    constructor(private readonly projectService: ProjectService) {}

    ngOnInit() {
        this.tasksByStatus$ = this.projectService.getTasksByStatus(this.projectId);
        this.tasksByStatus$.pipe(
            takeUntil(this.destroy$)
        ).subscribe();
    }

    onTaskDrop(event: any) {
        if (event.previousContainer === event.container) {
            return;
        }

        const task = event.item.data;
        const newStatus = event.container.id as TaskStatus;

        this.projectService.updateTask(this.projectId, {
            ...task,
            status: newStatus
        });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
