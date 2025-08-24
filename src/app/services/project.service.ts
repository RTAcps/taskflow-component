import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Project, Task, TeamMember, TaskStatus, ProjectStatus, TaskPriority } from '../models/project.model';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private projectsSubject = new BehaviorSubject<Project[]>([]);
    projects$ = this.projectsSubject.asObservable();

    constructor(private storageService: StorageService) {
        console.log('ProjectService inicializado');
        this.loadProjects();
        if (this.projectsSubject.value.length === 0) {
            console.log('Nenhum projeto encontrado, carregando dados de exemplo');
            this.loadMockData();
        } else {
            console.log('Projetos carregados:', this.projectsSubject.value.length);
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
        console.log('Buscando projeto por ID:', id);
        return this.projects$.pipe(
            map(projects => {
                const project = projects.find(p => p.id === id);
                console.log('Projeto encontrado?', !!project);
                if (project) {
                    console.log(`Projeto ${project.name} tem ${project.tasks?.length || 0} tarefas`);
                }
                return project;
            })
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
    addTask(projectId: string, task: Task): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            // Garantir que o status é um valor válido do enum
            const validStatus = Object.values(TaskStatus).includes(task.status) 
                ? task.status 
                : TaskStatus.TODO;
            
            // Garantir que a prioridade é um valor válido do enum
            const validPriority = Object.values(TaskPriority).includes(task.priority as TaskPriority)
                ? task.priority
                : TaskPriority.MEDIUM;
            
            // Criar uma nova tarefa com valores validados
            const newTask: Task = {
                ...task,
                status: validStatus,
                priority: validPriority as TaskPriority
            };
            
            console.log('Adicionando tarefa ao projeto:', newTask);
            
            project.tasks = [...project.tasks, newTask];
            this.projectsSubject.next([...projects]);
            this.saveProjects(); // Salvar as alterações
            
            console.log(`Tarefa "${task.title}" adicionada ao projeto "${project.name}"`);
            console.log('Total de tarefas agora:', project.tasks.length);
        } else {
            console.error(`Projeto com ID ${projectId} não encontrado`);
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
                this.saveProjects(); // Salvar as alterações
                console.log(`Tarefa "${updatedTask.title}" atualizada no projeto "${project.name}"`);
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
        const makeTask = (t: Partial<Task>): Task => ({
            id: t.id ?? crypto.randomUUID(),
            title: t.title ?? 'Untitled',
            description: t.description ?? '',
            status: t.status ?? TaskStatus.TODO,
            priority: t.priority ?? TaskPriority.MEDIUM,
            createdDate: t.createdDate ?? new Date(),
            tags: t.tags ?? [],
            assignee: t.assignee,
            dueDate: t.dueDate
            // intentionally omit priorityColor; cast below to satisfy typing if needed
        } as Task);

        const mockProjects: Project[] = [
            {
            id: crypto.randomUUID(),
            name: 'Website Redesign',
            description: 'Redesign da página principal da empresa',
            status: ProjectStatus.ACTIVE as any,
            startDate: new Date(2025, 5, 1),
            createdBy: 'John Doe',
            tasks: [
                makeTask({
                id: crypto.randomUUID(),
                title: 'Wireframes',
                description: 'Criar wireframes para todas as páginas',
                status: TaskStatus.DONE,
                priority: TaskPriority.HIGH,
                createdDate: new Date(2025, 5, 5),
                tags: ['design', 'ui']
                }),
                makeTask({
                id: crypto.randomUUID(),
                title: 'Desenvolvimento Frontend',
                description: 'Implementar HTML/CSS baseado nos wireframes',
                status: TaskStatus.IN_PROGRESS,
                priority: TaskPriority.MEDIUM,
                createdDate: new Date(2025, 5, 10),
                tags: ['frontend', 'development']
                }),
                makeTask({
                id: crypto.randomUUID(),
                title: 'Design de Componentes',
                description: 'Criar biblioteca de componentes reutilizáveis',
                status: TaskStatus.TODO,
                priority: TaskPriority.MEDIUM,
                createdDate: new Date(2025, 5, 15),
                tags: ['components', 'ui']
                }),
                makeTask({
                id: crypto.randomUUID(),
                title: 'Testes de Usabilidade',
                description: 'Conduzir testes de usabilidade com usuários',
                status: TaskStatus.BACKLOG,
                priority: TaskPriority.LOW,
                createdDate: new Date(2025, 6, 1),
                tags: ['testing', 'ux']
                }),
                makeTask({
                id: crypto.randomUUID(),
                title: 'SEO Otimização',
                description: 'Implementar práticas de SEO no site',
                status: TaskStatus.BACKLOG,
                priority: TaskPriority.HIGH,
                createdDate: new Date(2025, 6, 5),
                tags: ['seo', 'marketing']
                }),
                makeTask({
                id: crypto.randomUUID(),
                title: 'Revisão de Conteúdo',
                description: 'Revisar e atualizar o conteúdo do site',
                status: TaskStatus.REVIEW,
                priority: TaskPriority.MEDIUM,
                createdDate: new Date(2025, 5, 20),
                tags: ['content', 'copywriting']
                })
            ] as Task[],
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
            status: ProjectStatus.ON_HOLD as any,
            startDate: new Date(2025, 7, 15),
            createdBy: 'Jane Smith',
            tasks: [
                makeTask({
                id: crypto.randomUUID(),
                title: 'Prototipagem',
                description: 'Criar protótipos interativos',
                status: TaskStatus.DONE,
                priority: TaskPriority.HIGH,
                createdDate: new Date(),
                tags: ['design', 'prototype']
                })
            ] as Task[],
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
        
        this.projectsSubject.next(mockProjects);
        this.saveProjects();
    }
}
