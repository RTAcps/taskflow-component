import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Project, Task, TeamMember, TaskStatus } from '../models/project.model';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private projectsSubject = new BehaviorSubject<Project[]>([]);
    projects$ = this.projectsSubject.asObservable();

    constructor(private storageService: StorageService) {
        this.loadProjects();
        // Se não tiver projetos, carrega dados mock
        if (this.projectsSubject.value.length === 0) {
            this.loadMockData();
        }
    }

    private loadProjects() {
        const projects = this.storageService.loadProjects();
        this.projectsSubject.next(projects);
    }

    private saveProjects() {
        this.storageService.saveProjects(this.projectsSubject.value);
    }

    // CRUD Operations
    getProjects(): Observable<Project[]> {
        return this.projects$;
    }

    getProjectById(id: string): Observable<Project | undefined> {
        return this.projects$.pipe(
            map(projects => projects.find(p => p.id === id))
        );
    }

    createProject(project: Omit<Project, 'id'>): void {
        const newProject: Project = {
            ...project,
            id: crypto.randomUUID(),
            tasks: [],
            members: []
        };
        
        const currentProjects = this.projectsSubject.value;
        this.projectsSubject.next([...currentProjects, newProject]);
        this.saveProjects();
    }

    updateProject(updatedProject: Project): void {
        const projects = this.projectsSubject.value;
        const index = projects.findIndex(p => p.id === updatedProject.id);
        
        if (index !== -1) {
            projects[index] = updatedProject;
            this.projectsSubject.next([...projects]);
            this.saveProjects();
        }
    }

    deleteProject(projectId: string): void {
        const projects = this.projectsSubject.value;
        this.projectsSubject.next(projects.filter(p => p.id !== projectId));
        this.saveProjects();
    }

    // Task Operations
    addTask(projectId: string, task: Omit<Task, 'id'>): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            const newTask: Task = {
                ...task,
                id: crypto.randomUUID(),
            };
            
            project.tasks = [...project.tasks, newTask];
            this.projectsSubject.next([...projects]);
        }
    }

    updateTask(projectId: string, updatedTask: Task): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            const taskIndex = project.tasks.findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
                project.tasks[taskIndex] = updatedTask;
                this.projectsSubject.next([...projects]);
            }
        }
    }

    deleteTask(projectId: string, taskId: string): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            project.tasks = project.tasks.filter(t => t.id !== taskId);
            this.projectsSubject.next([...projects]);
        }
    }

    // Team Member Operations
    addTeamMember(projectId: string, member: TeamMember): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project && !project.members.find(m => m.id === member.id)) {
            project.members = [...project.members, member];
            this.projectsSubject.next([...projects]);
        }
    }

    removeTeamMember(projectId: string, memberId: string): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            project.members = project.members.filter(m => m.id !== memberId);
            // Também remove o membro de todas as tasks atribuídas
            project.tasks = project.tasks.map(task => {
                if (task.assignee?.id === memberId) {
                    return { ...task, assignee: undefined };
                }
                return task;
            });
            this.projectsSubject.next([...projects]);
        }
    }

    // Kanban Board Methods
    getTasksByStatus(projectId: string): Observable<{ [key in TaskStatus]: Task[] }> {
        return this.getProjectById(projectId).pipe(
            map(project => {
                if (!project) return {} as { [key in TaskStatus]: Task[] };

                return project.tasks.reduce((acc, task) => {
                    if (!acc[task.status]) {
                        acc[task.status] = [];
                    }
                    acc[task.status].push(task);
                    return acc;
                }, {} as { [key in TaskStatus]: Task[] });
            })
        );
    }

    // Search and Filter Methods
    searchProjects(query: string): Observable<Project[]> {
        return this.projects$.pipe(
            map(projects => projects.filter(project => 
                project.name.toLowerCase().includes(query.toLowerCase()) ||
                project.description.toLowerCase().includes(query.toLowerCase())
            ))
        );
    }

    filterTasks(projectId: string, filters: {
        status?: TaskStatus[],
        assignee?: string,
        priority?: string[],
        tags?: string[]
    }): Observable<Task[]> {
        return this.getProjectById(projectId).pipe(
            map(project => {
                if (!project) return [];

                return project.tasks.filter(task => {
                    let matches = true;
                    
                    if (filters.status && filters.status.length > 0) {
                        matches = matches && filters.status.includes(task.status);
                    }
                    
                    if (filters.assignee) {
                        matches = matches && task.assignee?.id === filters.assignee;
                    }
                    
                    if (filters.priority && filters.priority.length > 0) {
                        matches = matches && filters.priority.includes(task.priority);
                    }
                    
                    if (filters.tags && filters.tags.length > 0) {
                        matches = matches && filters.tags.some(tag => task.tags.includes(tag));
                    }
                    
                    return matches;
                });
            })
        );
    }

    private loadMockData(): void {
        const mockProjects: Project[] = [
            {
                id: crypto.randomUUID(),
                name: 'Website Redesign',
                description: 'Redesign da página principal da empresa',
                status: 'ACTIVE' as any,
                startDate: new Date(2025, 5, 1),
                createdBy: 'John Doe',
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        title: 'Wireframes',
                        description: 'Criar wireframes para todas as páginas',
                        status: 'DONE' as any,
                        priority: 'HIGH' as any,
                        createdDate: new Date(),
                        tags: ['design', 'ui']
                    },
                    {
                        id: crypto.randomUUID(),
                        title: 'Desenvolvimento Frontend',
                        description: 'Implementar HTML/CSS baseado nos wireframes',
                        status: 'IN_PROGRESS' as any,
                        priority: 'MEDIUM' as any,
                        createdDate: new Date(),
                        tags: ['frontend', 'development']
                    }
                ],
                members: [
                    {
                        id: crypto.randomUUID(),
                        name: 'Alice Johnson',
                        email: 'alice@example.com',
                        role: 'Designer'
                    },
                    {
                        id: crypto.randomUUID(),
                        name: 'Bob Smith',
                        email: 'bob@example.com',
                        role: 'Developer'
                    }
                ]
            },
            {
                id: crypto.randomUUID(),
                name: 'App Mobile',
                description: 'Desenvolvimento de aplicativo móvel iOS/Android',
                status: 'ON_HOLD' as any,
                startDate: new Date(2025, 7, 15),
                createdBy: 'Jane Smith',
                tasks: [
                    {
                        id: crypto.randomUUID(),
                        title: 'Prototipagem',
                        description: 'Criar protótipos interativos',
                        status: 'DONE' as any,
                        priority: 'HIGH' as any,
                        createdDate: new Date(),
                        tags: ['design', 'prototype']
                    }
                ],
                members: [
                    {
                        id: crypto.randomUUID(),
                        name: 'Charlie Brown',
                        email: 'charlie@example.com',
                        role: 'Mobile Developer'
                    }
                ]
            }
        ];
        
        this.projectsSubject.next(mockProjects);
        this.saveProjects();
    }
}
