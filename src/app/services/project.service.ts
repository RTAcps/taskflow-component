import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Project, Task, TeamMember, TaskStatus, ProjectStatus, TaskPriority } from '../models/project.model';
import { StorageService } from './storage.service';
import { NotificationService } from './notification.service';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {
    private readonly projectsSubject = new BehaviorSubject<Project[]>([]);
    projects$ = this.projectsSubject.asObservable();

    constructor(
        private readonly storageService: StorageService,
        private readonly notificationService: NotificationService
    ) {
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
        
        // Notificar o usuário
        this.notificationService.success(
            `O projeto "${project.name}" foi criado com sucesso.`,
            'Projeto Criado'
        );
    }

    updateProject(updatedProject: Project): void {
        const projects = this.projectsSubject.value;
        const index = projects.findIndex(p => p.id === updatedProject.id);
        
        if (index !== -1) {
            const oldProject = projects[index];
            projects[index] = updatedProject;
            this.projectsSubject.next([...projects]);
            this.saveProjects();
            
            // Notificar o usuário
            this.notificationService.success(
                `O projeto "${updatedProject.name}" foi atualizado com sucesso.`,
                'Projeto Atualizado'
            );
        }
    }

    deleteProject(projectId: string): void {
        const projects = this.projectsSubject.value;
        const projectToDelete = projects.find(p => p.id === projectId);
        
        if (projectToDelete) {
            const projectName = projectToDelete.name;
            this.projectsSubject.next(projects.filter(p => p.id !== projectId));
            this.saveProjects();
            
            // Notificar o usuário
            this.notificationService.success(
                `O projeto "${projectName}" foi excluído com sucesso.`,
                'Projeto Excluído'
            );
        }
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
            
            // Notificar o usuário
            this.notificationService.success(
                `A tarefa "${task.title}" foi adicionada ao projeto "${project.name}".`,
                'Tarefa Adicionada'
            );
        } else {
            console.error(`Projeto com ID ${projectId} não encontrado`);
            this.notificationService.error(
                `Não foi possível adicionar a tarefa. Projeto não encontrado.`,
                'Erro'
            );
        }
    }

    updateTask(projectId: string, updatedTask: Task): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            // Garantir que o status é um valor válido do enum
            const validStatus = Object.values(TaskStatus).includes(updatedTask.status) 
                ? updatedTask.status 
                : TaskStatus.TODO;
            
            // Garantir que a prioridade é um valor válido do enum
            const validPriority = Object.values(TaskPriority).includes(updatedTask.priority as TaskPriority)
                ? updatedTask.priority
                : TaskPriority.MEDIUM;
            
            // Atualizar tarefa com valores validados
            const taskWithValidValues: Task = {
                ...updatedTask,
                status: validStatus,
                priority: validPriority as TaskPriority
            };
            
            const taskIndex = project.tasks.findIndex(t => t.id === updatedTask.id);
            if (taskIndex !== -1) {
                project.tasks[taskIndex] = taskWithValidValues;
                this.projectsSubject.next([...projects]);
                this.saveProjects(); // Salvar as alterações
                console.log(`Tarefa "${updatedTask.title}" atualizada no projeto "${project.name}"`);
                
                // Notificar o usuário
                this.notificationService.success(
                    `A tarefa "${updatedTask.title}" foi atualizada com sucesso.`,
                    'Tarefa Atualizada'
                );
            } else {
                console.error(`Tarefa com ID ${updatedTask.id} não encontrada no projeto ${project.name}`);
                this.notificationService.error(
                    `Tarefa não encontrada no projeto "${project.name}".`,
                    'Erro'
                );
            }
        } else {
            console.error(`Projeto com ID ${projectId} não encontrado`);
            this.notificationService.error(
                `Não foi possível atualizar a tarefa. Projeto não encontrado.`,
                'Erro'
            );
        }
    }

    deleteTask(projectId: string, taskId: string): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            const taskToDelete = project.tasks.find(t => t.id === taskId);
            if (taskToDelete) {
                const taskTitle = taskToDelete.title;
                project.tasks = project.tasks.filter(t => t.id !== taskId);
                this.projectsSubject.next([...projects]);
                this.saveProjects(); // Salvar as alterações
                
                // Notificar o usuário
                this.notificationService.success(
                    `A tarefa "${taskTitle}" foi excluída do projeto "${project.name}".`,
                    'Tarefa Excluída'
                );
            } else {
                this.notificationService.error(
                    `Tarefa não encontrada no projeto "${project.name}".`,
                    'Erro'
                );
            }
        } else {
            console.error(`Projeto com ID ${projectId} não encontrado`);
            this.notificationService.error(
                `Não foi possível excluir a tarefa. Projeto não encontrado.`,
                'Erro'
            );
        }
    }

    // Team Member Operations
    addTeamMember(projectId: string, member: TeamMember): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            if (!project.members.find(m => m.id === member.id)) {
                project.members = [...project.members, member];
                this.projectsSubject.next([...projects]);
                this.saveProjects(); // Salvar as alterações
                
                // Notificar o usuário
                this.notificationService.success(
                    `${member.name} foi adicionado(a) à equipe do projeto "${project.name}".`,
                    'Membro Adicionado'
                );
            } else {
                this.notificationService.warn(
                    `${member.name} já faz parte da equipe do projeto "${project.name}".`,
                    'Atenção'
                );
            }
        } else {
            console.error(`Projeto com ID ${projectId} não encontrado`);
            this.notificationService.error(
                `Não foi possível adicionar o membro. Projeto não encontrado.`,
                'Erro'
            );
        }
    }

    removeTeamMember(projectId: string, memberId: string): void {
        const projects = this.projectsSubject.value;
        const project = projects.find(p => p.id === projectId);
        
        if (project) {
            const memberToRemove = project.members.find(m => m.id === memberId);
            if (memberToRemove) {
                const memberName = memberToRemove.name;
                
                project.members = project.members.filter(m => m.id !== memberId);
                
                // Também remove o membro de todas as tasks atribuídas
                project.tasks = project.tasks.map(task => {
                    if (task.assignee?.id === memberId) {
                        return { ...task, assignee: undefined };
                    }
                    return task;
                });
                
                this.projectsSubject.next([...projects]);
                this.saveProjects(); // Salvar as alterações
                
                // Notificar o usuário
                this.notificationService.success(
                    `${memberName} foi removido(a) da equipe do projeto "${project.name}".`,
                    'Membro Removido'
                );
            } else {
                this.notificationService.error(
                    `Membro não encontrado na equipe do projeto "${project.name}".`,
                    'Erro'
                );
            }
        } else {
            console.error(`Projeto com ID ${projectId} não encontrado`);
            this.notificationService.error(
                `Não foi possível remover o membro. Projeto não encontrado.`,
                'Erro'
            );
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
