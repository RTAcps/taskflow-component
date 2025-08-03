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
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
    CANCELLED = 'CANCELLED'
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
