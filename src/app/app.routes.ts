import { Routes } from '@angular/router';
import { ProjectListComponent } from './features/project/project-list.component';
import { ProjectFormComponent } from './features/project/project-form/project-form.component';
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
                path: 'projects/new',
                component: ProjectFormComponent
            },
            {
                path: 'projects/edit/:id',
                component: ProjectFormComponent
            },
            {
                path: 'projects/:id/board',
                component: KanbanBoardComponent
            }
        ]
    }
];
