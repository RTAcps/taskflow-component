import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Observable } from 'rxjs';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule
    ],
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss'],
})
export class ProjectListComponent implements OnInit {
    projects$!: Observable<Project[]>;
    loading = false;
    searchQuery = '';

    constructor(
        private readonly projectService: ProjectService,
        private readonly router: Router
    ) {}

    ngOnInit() {
        this.projects$ = this.projectService.getProjects();
    }

    onSearch(query: string) {
        this.projects$ = this.projectService.searchProjects(query);
    }

    getTaskProgress(project: Project): number {
        if (!project.tasks.length) return 0;
        const completed = this.getCompletedTasks(project);
        return (completed / project.tasks.length) * 100;
    }

    getCompletedTasks(project: Project): number {
        return project.tasks.filter(task => task.status === 'DONE').length;
    }

    createProject() {
        this.router.navigate(['/projects/new']);
    }

    editProject(project: Project) {
        this.router.navigate(['/projects/edit', project.id]);
    }

    deleteProject(project: Project) {
        this.projectService.deleteProject(project.id);
    }
}
