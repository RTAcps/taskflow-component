import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { NotificationService } from '../../services/notification.service';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-project-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule
    ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="project-list p-5">
            <h2 class="text-2xl font-bold mb-4 text-primary">Projetos</h2>
            <div class="flex gap-2 mb-5">
                <input 
                    class="px-4 py-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-primary"
                    type="text"
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="onSearch($event)"
                    placeholder="Buscar projetos"
                >
                <button 
                    class="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition-colors"
                    type="button" 
                    (click)="createProject()">
                    Novo Projeto
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div *ngFor="let project of projects$ | async" class="project-card">
                    <h3 class="text-xl font-semibold mb-2">{{ project.name }}</h3>
                    <p class="project-description mb-3">{{ project.description }}</p>
                    <p class="mb-1"><span class="font-medium">Status:</span> {{ project.status }}</p>
                    <p class="mb-4"><span class="font-medium">Tarefas:</span> {{ project.tasks.length || 0 }}</p>
                    <div class="flex gap-2">
                        <button class="btn-edit" (click)="editProject(project.id)">Editar</button>
                        <button class="btn-view" (click)="viewBoard(project.id)">Kanban</button>
                        <button class="btn-delete" (click)="deleteProject(project.id)">Excluir</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: block;
        }
        
        h2 {
            color: var(--primary-color);
        }
        
        .project-list {
            background-color: var(--surface-ground);
            color: var(--text-color);
        }
        
        .project-card {
            background-color: var(--surface-card);
            color: var(--text-color);
            border: 1px solid var(--surface-border);
            border-radius: 0.5rem;
            padding: 1.25rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            transition: box-shadow 0.3s ease;
        }
        
        .project-card:hover {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .project-card h3 {
            color: var(--primary-color);
        }
        
        .project-description {
            color: var(--text-color-secondary);
        }
        
        input {
            background-color: var(--surface-overlay) !important;
            color: var(--text-color) !important;
            border-color: var(--surface-border) !important;
        }
        
        input:focus {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
        }
        
        button {
            padding: 0.5rem 0.75rem;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .btn-edit {
            background-color: var(--blue-500);
            color: white;
        }
        
        .btn-view {
            background-color: var(--green-500);
            color: white;
        }
        
        .btn-delete {
            background-color: var(--red-500);
            color: white;
        }
        
        button:hover {
            opacity: 0.9;
        }

        .text-primary {
            color: var(--primary-color) !important;
        }
        
        .bg-primary {
            background-color: var(--primary-color) !important;
        }
    `]
})
export class ProjectListComponent implements OnInit {
    projects$!: Observable<Project[]>;
    loading = false;
    searchQuery = '';
    displayedColumns: string[] = ['name', 'status', 'startDate', 'members', 'tasks', 'actions'];

    constructor(
        private readonly projectService: ProjectService,
        @Inject(Router) private readonly router: Router,
        private readonly notificationService: NotificationService,
        private readonly themeService: ThemeService
    ) {}

    ngOnInit() {
        console.log('ProjectListComponent initialized');
        this.projects$ = this.projectService.getProjects();
        
        // Log para depuração
        this.projects$.subscribe(projects => {
            console.log('Projects loaded:', projects);
        });
        
        // Escutar mudanças de tema
        this.themeService.theme$.subscribe(theme => {
            console.log('Theme changed:', theme);
            document.body.classList.remove('light-theme', 'dark-theme');
            document.body.classList.add(`${theme}-theme`);
        });
    }

    onSearch(query: string) {
        this.projects$ = this.projectService.searchProjects(query);
    }
    
    createProject() {
        console.log('createProject called');
        
        const isInsideShell = window.location.port !== '4201';
        
        if (isInsideShell) {
            this.router.navigate(['/project-management/projects/new']);
        } else {
            this.router.navigate(['projects/new']);
        }
    }

    getTaskProgress(project: Project): number {
        if (!project.tasks.length) return 0;
        const completed = this.getCompletedTasks(project);
        return (completed / project.tasks.length) * 100;
    }

    getCompletedTasks(project: Project): number {
        return project.tasks.filter(task => task.status === 'DONE').length;
    }

    editProject(projectId: string) {
        const isInsideShell = window.location.port !== '4201';
        
        if (isInsideShell) {
            this.router.navigate(['/project-management/projects/edit', projectId]);
        } else {
            this.router.navigate(['/projects/edit', projectId]);
        }
    }

    viewBoard(projectId: string) {
        const isInsideShell = window.location.port !== '4201';
        
        if (isInsideShell) {
            this.router.navigate(['/project-management/projects', projectId, 'board']);
        } else {
            this.router.navigate(['/projects', projectId, 'board']);
        }
    }

    deleteProject(projectId: string) {
        // Usar o notificationService para confirmação
        this.projectService.getProjectById(projectId).subscribe(project => {
            if (project) {
                this.notificationService.confirm(
                    `Tem certeza que deseja excluir o projeto "${project.name}"? Esta ação não pode ser desfeita.`,
                    'Excluir Projeto'
                ).then(confirmed => {
                    if (confirmed) {
                        this.projectService.deleteProject(projectId);
                    }
                });
            }
        });
    }
}
