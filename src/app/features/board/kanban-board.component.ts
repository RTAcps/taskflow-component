import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Task, TaskPriority, TaskStatus } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'app-kanban-board',
    standalone: true,
    imports: [ CommonModule, DragDropModule, FormsModule ],
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="kanban-board">
            <div class="header-container">
                <button class="back-button" (click)="goBack()">
                    ← Voltar
                </button>
                <h2>Kanban Board - Projeto {{ projectName }}</h2>
                
                <button class="add-task-button" (click)="openNewTaskModal()">
                    Nova Tarefa
                </button>
            </div>
            
            <!-- Modal para adicionar nova tarefa -->
            <div *ngIf="showNewTaskForm" class="modal-overlay">
                <div class="modal-container" #modalContainer>
                    <div class="modal-header">
                        <h3>Adicionar Nova Tarefa</h3>
                        <button class="close-button" (click)="closeModal()">×</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Título</label>
                                <input [(ngModel)]="newTask.title" placeholder="Título da tarefa" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Descrição</label>
                                <textarea [(ngModel)]="newTask.description" placeholder="Descrição da tarefa"></textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Status</label>
                                <select [(ngModel)]="newTask.status">
                                    <option *ngFor="let status of taskStatusList" [value]="status">
                                        {{ getStatusLabel(status) }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Prioridade</label>
                                <select [(ngModel)]="newTask.priority">
                                    <option value="LOW">Baixa</option>
                                    <option value="MEDIUM">Média</option>
                                    <option value="HIGH">Alta</option>
                                    <option value="URGENT">Urgente</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="cancel-button" (click)="closeModal()">Cancelar</button>
                        <button class="save-button" [disabled]="!newTask.title" (click)="addTask()">Adicionar Tarefa</button>
                    </div>
                </div>
            </div>
            
            <div class="kanban-columns">
                <div *ngFor="let status of taskStatusList" class="kanban-column">
                    <h3>{{ getStatusLabel(status) }}</h3>
                    <div 
                        cdkDropList
                        [id]="status"
                        [cdkDropListData]="getTasksForStatus(status)"
                        [cdkDropListConnectedTo]="getConnectedLists()"
                        (cdkDropListDropped)="onTaskDrop($event)"
                        class="task-list"
                    >
                        <div 
                            *ngFor="let task of getTasksForStatus(status)" 
                            class="task-card"
                            cdkDrag
                            [cdkDragData]="task"
                        >
                            <div class="drag-handle" cdkDragHandle>
                                <svg width="24px" height="24px" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z" />
                                </svg>
                            </div>
                            <h4>{{ task.title }}</h4>
                            <p>{{ task.description }}</p>
                            <div class="task-meta">
                                <span class="priority" [ngClass]="task.priority === 'URGENT' ? 'priority-urgent' : 'priority-' + task.priority.toLowerCase()">{{ task.priority }}</span>
                                <span *ngIf="task.assignee" class="assignee">
                                    {{ task.assignee.name }}
                                </span>
                            </div>
                            <div class="task-preview" *cdkDragPreview>
                                <h4>{{ task.title }}</h4>
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
            --priority-highest: #d32f2f;
            --priority-high: #f44336;
            --priority-medium: #ff9800;
            --priority-low: #4caf50;
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
            min-height: 300px;
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
            border-radius: 4px;
        }
        .cdk-drop-list-dragging {
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
            background-color: rgba(0, 0, 0, 0.04);
        }
        .task-card {
            background: white;
            border: 1px solid #ddd;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 12px;
            position: relative;
            cursor: move;
            transition: box-shadow 200ms ease, transform 200ms ease;
        }
        .task-card:hover {
            box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23);
        }
        .cdk-drag-preview {
            box-sizing: border-box;
            border-radius: 4px;
            box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                        0 8px 10px 1px rgba(0, 0, 0, 0.14),
                        0 3px 14px 2px rgba(0, 0, 0, 0.12);
        }
        .cdk-drag-placeholder {
            opacity: 0;
        }
        .cdk-drag-animating {
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }
        .task-list.cdk-drop-list-dragging .task-card:not(.cdk-drag-placeholder) {
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
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
            color: #000;
            font-weight: 500;
        }
        .priority-urgent, 
        :host ::ng-deep .priority-urgent {
            background-color: var(--priority-highest, #d32f2f) !important;
            color: white !important;
        }
        .priority-high, 
        :host ::ng-deep .priority-high {
            background-color: var(--priority-high, #f44336) !important;
            color: white !important;
        }
        .priority-medium, 
        :host ::ng-deep .priority-medium {
            background-color: var(--priority-medium, #ff9800) !important;
            color: #000 !important;
        }
        .priority-low, 
        :host ::ng-deep .priority-low {
            background-color: var(--priority-low, #4caf50) !important;
            color: white !important;
        }
        .assignee {
            font-weight: 500;
        }
        .drag-handle {
            position: absolute;
            top: 8px;
            right: 8px;
            color: #ccc;
            cursor: move;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .task-preview {
            padding: 10px;
            background-color: white;
            border-radius: 4px;
            box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                        0 8px 10px 1px rgba(0, 0, 0, 0.14),
                        0 3px 14px 2px rgba(0, 0, 0, 0.12);
        }
        
        /* Estilos para o formulário de nova tarefa */
        .add-task-button {
            background-color: var(--primary-color, #3B82F6);
            color: white;
            border: none;
            border-radius: 4px;
            padding: 8px 16px;
            margin-left: auto;
            cursor: pointer;
        }
        .add-task-button:hover {
            background-color: var(--primary-700, #0c61e4);
        }
        .new-task-form {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .new-task-form h3 {
            margin-top: 0;
            margin-bottom: 16px;
        }
        .form-row {
            display: flex;
            gap: 16px;
            margin-bottom: 16px;
        }
        .form-group {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        .form-group label {
            margin-bottom: 8px;
            font-weight: 500;
        }
        .form-group input, .form-group textarea, .form-group select {
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .form-group textarea {
            min-height: 80px;
            resize: vertical;
        }
        .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        .cancel-button {
            padding: 8px 16px;
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        .save-button {
            padding: 8px 16px;
            background: var(--primary-color, #3B82F6);
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        .save-button:hover {
            background-color: var(--primary-700, #0c61e4);
        }
        .save-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        /* Estilos para o modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            backdrop-filter: blur(3px);
        }
        .modal-container {
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            animation: modal-appear 0.3s ease;
        }
        @keyframes modal-appear {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #eee;
        }
        .modal-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        .close-button {
            background: transparent;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #999;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
        }
        .close-button:hover {
            background: #f5f5f5;
            color: #333;
        }
        .modal-body {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(90vh - 120px); /* header + footer height */
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            padding: 16px 20px;
            border-top: 1px solid #eee;
        }
    `]
})
export class KanbanBoardComponent implements OnInit {
    @Input() projectId!: string;
    @ViewChild('modalContainer') modalContainer!: ElementRef;
    private readonly destroy$ = new Subject<void>();
    
    // Nome do projeto atual
    projectName: string = '';
    
    // Estados para o formulário de nova tarefa
    showNewTaskForm = false;
    newTask: Partial<Task> = {
        title: '',
        description: '',
        status: TaskStatus.TODO,
        priority: 'MEDIUM' as TaskPriority,
        tags: []
    };
    
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
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) {}

    ngOnInit() {
        console.log('[KanbanBoard] inicializado');
        console.log('[KanbanBoard] projectId de @Input:', this.projectId);
        
        // Debugar a URL atual
        console.log('[KanbanBoard] URL atual:', window.location.href);
        
        // Debug do snapshot da rota
        console.log('[KanbanBoard] Params da rota (snapshot):', this.route.snapshot.params);
        console.log('[KanbanBoard] Parâmetros disponíveis:', 
                   Object.keys(this.route.snapshot.params).length > 0 
                   ? Object.keys(this.route.snapshot.params).join(', ') 
                   : 'nenhum');
        
        // Se não tiver projectId como @Input, tenta pegar da rota
        if (!this.projectId) {
            console.log('[KanbanBoard] Tentando obter ID da rota (assíncrono)');
            
            this.route.paramMap.subscribe(params => {
                console.log('[KanbanBoard] ParamMap recebido:', params);
                const routeId = params.get('id');
                console.log('[KanbanBoard] ID da rota:', routeId);
                
                if (routeId) {
                    console.log('[KanbanBoard] Usando ID da rota:', routeId);
                    this.projectId = routeId;
                    this.loadTasks();
                } else {
                    console.warn('[KanbanBoard] ERRO: projectId não encontrado nem como @Input nem na rota');
                    
                    // Tentar buscar de outras fontes como último recurso
                    if (window.location.pathname.includes('/projects/')) {
                        const pathParts = window.location.pathname.split('/');
                        const idIndex = pathParts.indexOf('projects') + 1;
                        if (idIndex < pathParts.length && pathParts[idIndex] !== 'board') {
                            const possibleId = pathParts[idIndex];
                            console.log('[KanbanBoard] Tentando extrair ID da URL:', possibleId);
                            this.projectId = possibleId;
                            this.loadTasks();
                        }
                    }
                }
            });
        } else {
            console.log('[KanbanBoard] Usando projectId do @Input:', this.projectId);
            this.loadTasks();
        }
    }
    
    goBack() {
        console.log('[KanbanBoard] Navegando de volta para a lista de projetos');
        
        // Determina se estamos no aplicativo shell ou no aplicativo independente
        const isInsideShell = window.location.port !== '4201';
        console.log('[KanbanBoard] Executando dentro do shell?', isInsideShell);
        
        // Log da URL atual para debug
        console.log('[KanbanBoard] URL atual:', window.location.href);
        
        try {
            if (isInsideShell) {
                console.log('[KanbanBoard] Navegando para /project-management no shell');
                this.router.navigate(['/project-management']);
            } else {
                console.log('[KanbanBoard] Navegando para /projects no app standalone');
                this.router.navigate(['/projects']);
            }
        } catch (error) {
            console.error('[KanbanBoard] Erro ao navegar:', error);
            
            // Fallback em caso de erro
            if (isInsideShell) {
                window.location.href = '/project-management';
            } else {
                window.location.href = '/projects';
            }
        }
    }

    private loadTasks() {
        console.log('[KanbanBoard] Carregando tarefas para o projeto ID:', this.projectId);
        
        // Tentamos carregar o projeto algumas vezes em caso de demora na inicialização
        let attempts = 0;
        const maxAttempts = 3;
        const attemptLoadProject = () => {
            // Verificar todos os projetos primeiro para debugging
            this.projectService.getProjects().subscribe(allProjects => {
                console.log('[KanbanBoard] Total de projetos disponíveis:', allProjects.length);
                console.log('[KanbanBoard] Lista de todos os projetos:');
                allProjects.forEach(p => {
                    console.log(`- Projeto: ${p.id} - ${p.name}, Tarefas: ${p.tasks?.length || 0}`);
                });
                
                // Verifica se o projeto buscado está na lista
                const projectExists = allProjects.some(p => p.id === this.projectId);
                console.log('[KanbanBoard] O projeto existe na lista?', projectExists);
                
                if (!projectExists) {
                    console.warn(`[KanbanBoard] ERRO: Projeto ID ${this.projectId} não encontrado na lista de projetos!`);
                }
            });
            
            // Carregamos as tarefas do projeto e organizamos por status
            this.projectService.getProjectById(this.projectId)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (project) => {
                        if (project) {
                            console.log('[KanbanBoard] Projeto carregado com sucesso:', project.name, project.id);
                            console.log('[KanbanBoard] Tarefas encontradas:', project.tasks?.length || 0);
                            this.projectName = project.name;
                            
                            if (project.tasks?.length > 0) {
                                console.log('[KanbanBoard] Detalhes das tarefas:');
                                project.tasks.forEach(task => {
                                    console.log(`- Tarefa: ${task.id} - ${task.title} (${task.status})`);
                                });
                                this.organizeTasksByStatus(project.tasks);
                            } else {
                                console.warn('[KanbanBoard] O projeto não tem tarefas!');
                                // Reset das colunas para arrays vazios
                                Object.keys(this.tasksByStatus).forEach(status => {
                                    this.tasksByStatus[status as TaskStatus] = [];
                                });
                            }
                        } else {
                            console.error('[KanbanBoard] ERRO: Nenhum projeto encontrado com ID:', this.projectId);
                            
                            // Tentar novamente após um pequeno delay
                            attempts++;
                            if (attempts < maxAttempts) {
                                console.log(`[KanbanBoard] Tentativa ${attempts}/${maxAttempts} de carregar o projeto...`);
                                setTimeout(attemptLoadProject, 500);
                            }
                        }
                    },
                    error: (err) => {
                        console.error('[KanbanBoard] Erro ao carregar o projeto:', err);
                    }
                });
        };
        
        // Primeira tentativa
        attemptLoadProject();
    }

    private organizeTasksByStatus(tasks: Task[]) {
        console.log('[KanbanBoard] Organizando tarefas por status:', tasks.length, 'tarefas');
        
        // Reset all arrays
        Object.keys(this.tasksByStatus).forEach(status => {
            this.tasksByStatus[status as TaskStatus] = [];
        });

        // Verificar o enum TaskStatus para garantir que é válido
        console.log('[KanbanBoard] Valores válidos de TaskStatus:', Object.values(TaskStatus));

        // Organize tasks by status
        tasks.forEach(task => {
            console.log(`[KanbanBoard] Processando tarefa: ${task.id} - ${task.title}, Status: ${task.status}`);
            
            // Verificar se o status é uma string ou enum
            const statusKey = task.status as TaskStatus;
            
            // Se o status não existir como chave no objeto tasksByStatus
            if (!Object.prototype.hasOwnProperty.call(this.tasksByStatus, statusKey)) {
                console.warn(`[KanbanBoard] Status inválido encontrado: "${task.status}". Movendo para Backlog.`);
                
                // Atualizar o status da tarefa para Backlog
                const updatedTask = { ...task, status: TaskStatus.BACKLOG };
                this.projectService.updateTask(this.projectId, updatedTask);
                
                // Adicionar à coluna Backlog
                this.tasksByStatus[TaskStatus.BACKLOG].push(updatedTask);
            } else {
                this.tasksByStatus[statusKey].push(task);
            }
        });
        
        // Log das tarefas organizadas
        console.log('[KanbanBoard] Distribuição de tarefas por status:');
        Object.keys(this.tasksByStatus).forEach(status => {
            console.log(`- Status ${status}: ${this.tasksByStatus[status as TaskStatus].length} tarefas`);
            
            // Log detalhado das tarefas em cada status
            if (this.tasksByStatus[status as TaskStatus].length > 0) {
                this.tasksByStatus[status as TaskStatus].forEach((task, index) => {
                    console.log(`  ${index+1}. ${task.title} (${task.id})`);
                });
            }
        });
        
        // Forçar detecção de alterações para atualizar a view
        setTimeout(() => {
            console.log('[KanbanBoard] View atualizada com as tarefas');
        }, 0);
    }

    getTasksForStatus(status: TaskStatus): Task[] {
        // Garantir que tasksByStatus foi inicializado
        if (!this.tasksByStatus) {
            console.warn('[KanbanBoard] tasksByStatus não inicializado em getTasksForStatus');
            return [];
        }
        
        // Verificar se o status existe no mapeamento
        if (!Object.prototype.hasOwnProperty.call(this.tasksByStatus, status)) {
            console.warn(`[KanbanBoard] Status inválido solicitado: ${status}`);
            return [];
        }
        
        const tasks = this.tasksByStatus[status] || [];
        console.log(`[KanbanBoard] getTasksForStatus(${status}): ${tasks.length} tarefas`);
        
        // Verificação adicional para debugging
        if (tasks.length > 0) {
            console.log(`[KanbanBoard] Exemplos de tarefas em ${status}:`, 
                tasks.slice(0, Math.min(2, tasks.length)).map(t => t.title).join(', '));
        }
        
        return tasks;
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
    
    /**
     * Retorna os IDs de todas as listas para conectá-las
     */
    getConnectedLists(): string[] {
        return this.taskStatusList;
    }
    
    /**
     * Manipula o evento de drop de uma tarefa
     */
    onTaskDrop(event: CdkDragDrop<Task[]>) {
        const { previousContainer, container, previousIndex, currentIndex } = event;
        
        if (previousContainer === container) {
            // Moveu dentro da mesma coluna
            moveItemInArray(container.data, previousIndex, currentIndex);
        } else {
            // Moveu para uma coluna diferente
            const task = event.item.data as Task;
            const newStatus = container.id as TaskStatus;
            
            // Atualiza o status da tarefa
            this.updateTaskStatus(task, newStatus);
            
            // Move o item entre os arrays
            transferArrayItem(
                previousContainer.data,
                container.data,
                previousIndex,
                currentIndex
            );
        }
    }
    
    /**
     * Atualiza o status de uma tarefa
     */
    updateTaskStatus(task: Task, newStatus: TaskStatus) {
        // Cria uma cópia da tarefa com o novo status
        const updatedTask: Task = {
            ...task,
            status: newStatus,
            updatedAt: new Date()
        };
        
        // Atualizar a tarefa diretamente usando o serviço
        this.projectService.updateTask(this.projectId, updatedTask);
        console.log(`Tarefa "${task.title}" movida para ${this.getStatusLabel(newStatus)}`);
    }

    /**
     * Abre o modal para criar nova tarefa
     */
    openNewTaskModal() {
        this.showNewTaskForm = true;
        document.body.style.overflow = 'hidden'; // Impede rolagem de fundo
    }
    
    /**
     * Fecha o modal
     */
    closeModal() {
        this.showNewTaskForm = false;
        document.body.style.overflow = ''; // Restaura rolagem
        
        // Limpa o formulário
        this.newTask = {
            title: '',
            description: '',
            status: TaskStatus.TODO,
            priority: 'MEDIUM' as TaskPriority,
            tags: []
        };
    }
    
    /**
     * Trata cliques fora do modal para fechá-lo
     */
    @HostListener('click', ['$event'])
    onOverlayClick(event: MouseEvent) {
        // Se o clique foi fora do conteúdo do modal, feche-o
        if (this.showNewTaskForm && 
            this.modalContainer && 
            !this.modalContainer.nativeElement.contains(event.target)) {
            this.closeModal();
        }
    }
    
    /**
     * Adiciona uma nova tarefa ao projeto
     */
    addTask() {
        if (!this.newTask.title) {
            console.warn('[KanbanBoard] Tentativa de adicionar tarefa sem título');
            return;
        }
        
        if (!this.projectId) {
            console.error('[KanbanBoard] Erro: tentativa de adicionar tarefa sem ID do projeto');
            alert('Erro: Não foi possível identificar o projeto para adicionar a tarefa.');
            return;
        }
        
        console.log('[KanbanBoard] Criando nova tarefa:', this.newTask);
        console.log('[KanbanBoard] Para o projeto ID:', this.projectId);
        
        const taskData: Task = {
            id: crypto.randomUUID(),
            title: this.newTask.title,
            description: this.newTask.description || '',
            status: this.newTask.status || TaskStatus.TODO,
            priority: this.newTask.priority as TaskPriority || TaskPriority.MEDIUM,
            createdDate: new Date(),
            tags: this.newTask.tags || []
        };
        
        console.log('[KanbanBoard] Nova tarefa criada:', taskData);
        
        try {
            // Adicionar a tarefa ao projeto
            this.projectService.addTask(this.projectId, taskData);
            
            console.log('[KanbanBoard] Tarefa adicionada ao projeto, atualizando visualização...');
            
            // Imediatamente adiciona à visualização local também
            this.tasksByStatus[taskData.status].push(taskData);
            
            // Pequena espera para garantir que os dados foram salvos
            setTimeout(() => {
                console.log('[KanbanBoard] Recarregando tarefas após adição...');
                
                // Recarregar as tarefas do projeto para garantir sincronização
                this.loadTasks();
                
                // Fechar o modal
                this.closeModal();
            }, 300);
        } catch (error) {
            console.error('[KanbanBoard] Erro ao adicionar tarefa:', error);
            alert('Ocorreu um erro ao adicionar a tarefa. Por favor, tente novamente.');
        }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
