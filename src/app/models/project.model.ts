export interface Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    startDate: Date;
    endDate?: Date;
    createdBy: string;
    tasks: Task[];
    members: TeamMember[];
}

export enum ProjectStatus {
    ACTIVE = 'Ativo',
    COMPLETED = 'Concluído',
    ON_HOLD = 'Pausado',
    CANCELLED = 'Cancelado'
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee?: TeamMember;
    dueDate?: Date;
    createdDate: Date;
    tags: string[];
}

export enum TaskStatus {
    BACKLOG = 'BACKLOG',
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    REVIEW = 'REVIEW',
    DONE = 'DONE'
}

export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    URGENT = 'URGENT'
}

export interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
}
