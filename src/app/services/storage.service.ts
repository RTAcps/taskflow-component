import { Injectable } from '@angular/core';
import { Project } from '../models/project.model';

@Injectable({
    providedIn: 'root'
})
export class StorageService {
    private readonly STORAGE_KEY = 'taskflow_projects';

    saveProjects(projects: Project[]): void {
        console.log('Salvando projetos no sessionStorage:', projects);
        const serialized = JSON.stringify(projects);
        sessionStorage.setItem(this.STORAGE_KEY, serialized);
        console.log('Projetos salvos, tamanho:', serialized.length, 'bytes');
    }

    loadProjects(): Project[] {
        console.log('Carregando projetos do sessionStorage');
        const data = sessionStorage.getItem(this.STORAGE_KEY);
        if (data) {
            console.log('Dados encontrados no sessionStorage, tamanho:', data.length, 'bytes');
            try {
                const projects = JSON.parse(data) as Project[];
                console.log('Projetos carregados (brutos):', projects.length);
                
                // Log detalhado dos projetos antes da conversão
                projects.forEach(project => {
                    console.log(`Projeto ${project.id} - ${project.name} tem ${project.tasks?.length || 0} tarefas`);
                });
                
                // Converte strings de data para objetos Date
                const parsedProjects = projects.map(project => ({
                    ...project,
                    startDate: new Date(project.startDate),
                    endDate: project.endDate ? new Date(project.endDate) : undefined,
                    tasks: Array.isArray(project.tasks) ? project.tasks.map(task => ({
                        ...task,
                        createdDate: new Date(task.createdDate),
                        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                        updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined
                    })) : []
                }));
                
                console.log('Projetos processados após conversão de datas:', parsedProjects.length);
                console.log('Total de tarefas após conversão:', parsedProjects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0));
                
                // Log detalhado dos projetos após a conversão
                parsedProjects.forEach(project => {
                    console.log(`Projeto processado ${project.id} - ${project.name}`);
                    console.log(`- Tem ${project.tasks?.length || 0} tarefas`);
                    if (project.tasks?.length > 0) {
                        console.log(`- Primeira tarefa: ${project.tasks[0]?.title}, status: ${project.tasks[0]?.status}`);
                    }
                });
                
                return parsedProjects;
            } catch (error) {
                console.error('Erro ao processar projetos do sessionStorage:', error);
                // Em caso de erro, limpa o storage e retorna array vazio
                sessionStorage.removeItem(this.STORAGE_KEY);
                return [];
            }
        }
        console.log('Nenhum projeto encontrado no sessionStorage');
        return [];
    }
}
