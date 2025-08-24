import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

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
            <h2 class="text-2xl font-bold mb-4 text-primary-700">Projetos</h2>
            <div class="flex gap-2 mb-5">
                <input 
                    class="px-4 py-2 border rounded-md flex-grow focus:outline-none focus:ring-2 focus:ring-primary-500"
                    type="text"
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="onSearch($event)"
                    placeholder="Buscar projetos"
                >
                <button 
                    class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                    type="button" 
                    (click)="createProject()">
                    Novo Projeto
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div *ngFor="let project of projects$ | async" class="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                    <h3 class="text-xl font-semibold mb-2 text-primary-700">{{ project.name }}</h3>
                    <p class="text-gray-600 mb-3">{{ project.description }}</p>
                    <p class="mb-1"><span class="font-medium">Status:</span> {{ project.status }}</p>
                    <p class="mb-4"><span class="font-medium">Tarefas:</span> {{ project.tasks.length || 0 }}</p>
                    <div class="flex gap-2">
                        <button class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" (click)="editProject(project.id)">Editar</button>
                        <button class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" (click)="viewBoard(project.id)">Kanban</button>
                        <button class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" (click)="deleteProject(project.id)">Excluir</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .actions {
            display: flex;
            gap: 8px;
            margin-top: 12px;
        }
        button {
            padding: 8px 12px;
            border: 1px solid #ccc;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            opacity: 0.7;
        }
        input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            flex: 1;
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
        @Inject(Router) private readonly router: Router
    ) {}

    ngOnInit() {
        console.log('ProjectListComponent initialized');
        this.projects$ = this.projectService.getProjects();
        
        // Log para depuração
        this.projects$.subscribe(projects => {
            console.log('Projects loaded:', projects);
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
        if (confirm('Tem certeza que deseja excluir este projeto?')) {
            this.projectService.deleteProject(projectId);
        }
    }
}
