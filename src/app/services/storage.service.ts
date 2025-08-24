import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly STORAGE_KEY = 'taskflow_projects';

    saveProjects(projects: Project[]): void {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projects));
    }

    loadProjects(): Project[] {
        const data = localStorage.getItem(this.STORAGE_KEY);
        if (data) {
            const projects = JSON.parse(data) as Project[];
            return projects.map(project => ({
                ...project,
                startDate: new Date(project.startDate),
                endDate: project.endDate ? new Date(project.endDate) : undefined,
                tasks: project.tasks.map(task => ({
                    ...task,
                    createdDate: new Date(task.createdDate),
                    dueDate: task.dueDate ? new Date(task.dueDate) : undefined
                }))
            }));
        }
        return [];
    }
}
