import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Project, Task, TeamMember, TaskStatus } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private projectsSubject = new BehaviorSubject<Project[]>([]);
    projects$ = this.projectsSubject.asObservable();

    constructor() {
        // Inicializa com dados mock para desenvolvimento
        this.loadMockData();
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
    }

    updateProject(updatedProject: Project): void {
        const projects = this.projectsSubject.value;
        const index = projects.findIndex(p => p.id === updatedProject.id);
        
        if (index !== -1) {
            projects[index] = updatedProject;
            this.projectsSubject.next([...projects]);
        }
    }

    deleteProject(projectId: string): void {
        const projects = this.projectsSubject.value;
        this.projectsSubject.next(projects.filter(p => p.id !== projectId));
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
        // Implementar dados mock para desenvolvimento
    }
}
