import { Routes } from '@angular/router';
import { ProjectListComponent } from './features/project/project-list.component';
import { KanbanBoardComponent } from './features/board/kanban-board.component';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                redirectTo: 'projects',
                pathMatch: 'full'
            },
            {
                path: 'projects',
                component: ProjectListComponent
            },
            {
                path: 'projects/:id/board',
                component: KanbanBoardComponent
            }
            // Adicionar outras rotas conforme necessário
        ]
    }
];
