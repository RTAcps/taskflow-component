import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectStatus } from '../../../models/project.model';
import { ProjectService } from '../../../services/project.service';

@Component({
    selector: 'app-project-form',
    standalone: true,
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="project-form-container">
            <h2>{{ isEditMode ? 'Editar' : 'Novo' }} Projeto</h2>
            
            <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
                <div class="form-field">
                    <label for="name">Nome do Projeto</label>
                    <input 
                        id="name"
                        type="text" 
                        formControlName="name" 
                        placeholder="Digite o nome do projeto"
                    >
                    <div *ngIf="projectForm.get('name')?.errors?.['required'] && projectForm.get('name')?.touched" 
                         class="error">
                        Nome é obrigatório
                    </div>
                </div>

                <div class="form-field">
                    <label for="description">Descrição</label>
                    <textarea 
                        id="description"
                        formControlName="description" 
                        rows="4"
                        placeholder="Descreva o projeto">
                    </textarea>
                </div>

                <div class="form-field">
                    <label for="status">Status</label>
                    <select id="status" formControlName="status">
                        <option *ngFor="let option of statusOptions" [value]="option.value">
                            {{ option.label }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="startDate">Data de Início</label>
                    <input 
                        id="startDate"
                        type="date" 
                        formControlName="startDate"
                    >
                </div>

                <div class="form-field">
                    <label for="endDate">Data de Fim</label>
                    <input 
                        id="endDate"
                        type="date" 
                        formControlName="endDate"
                    >
                </div>

                <div class="form-field">
                    <label for="createdBy">Criado por</label>
                    <input 
                        id="createdBy"
                        type="text" 
                        formControlName="createdBy"
                        placeholder="Seu nome"
                    >
                </div>

                <div class="form-actions">
                    <button type="button" (click)="onCancel()">Cancelar</button>
                    <button type="submit" class="submit-button" [disabled]="projectForm.invalid || (isEditMode && !formChanged)">
                        <span class="button-text">{{ isEditMode ? 'Atualizar' : 'Criar' }}</span>
                    </button>
                </div>
            </form>
        </div>
    `,
    styles: [`
        .project-form-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .form-field {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        input, textarea, select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
        }
        .error {
            color: red;
            font-size: 12px;
            margin-top: 5px;
        }
        .form-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        button {
            padding: 10px 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        button[type="submit"] {
            background: #007bff;
            color: white;
            border-color: #007bff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 100px;
        }
        button[type="submit"]:disabled {
            background: #ccc;
            border-color: #ccc;
            cursor: not-allowed;
            opacity: 0.7;
        }
        .button-text {
            display: inline-block;
            color: white;
        }
        button[type="submit"]:disabled .button-text {
            color: #666;
        }
    `],
    imports: [
        CommonModule,
        ReactiveFormsModule
    ],
})
export class ProjectFormComponent implements OnInit {
    projectForm: FormGroup;
    isEditMode = false;
    formChanged = false;
    originalData: any = null;
    statusOptions = Object.values(ProjectStatus).map(status => ({
        label: status.replace('_', ' '),
        value: status
    }));

    constructor(
        private readonly fb: FormBuilder,
        private readonly projectService: ProjectService,
        private readonly router: Router,
        private readonly route: ActivatedRoute
    ) { 
        this.projectForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            status: [ProjectStatus.ACTIVE, Validators.required],
            startDate: [new Date(), Validators.required],
            endDate: [null],
            createdBy: ['', Validators.required]
        });
        
        // Monitor form changes
        this.projectForm.valueChanges.subscribe(() => {
            if (this.originalData) {
                this.formChanged = this.hasFormChanged();
            } else {
                this.formChanged = true;
            }
        });
    }

    ngOnInit() {
        const projectId = this.route.snapshot.paramMap.get('id');
        if (projectId) {
            this.isEditMode = true;
            this.loadProject(projectId);
        }
    }

    loadProject(projectId: string) {
        this.projectService.getProjectById(projectId).subscribe(project => {
            if (project) {
                const formData = {
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    startDate: new Date(project.startDate),
                    endDate: project.endDate ? new Date(project.endDate) : null,
                    createdBy: project.createdBy || ''
                };
                
                this.originalData = {...formData}; // Save original data
                this.projectForm.patchValue(formData);
                this.formChanged = false; // Reset form changed state
            } else {
                this.router.navigate(['/projects']);
            }
        });
    }
    
    hasFormChanged(): boolean {
        if (!this.originalData) return true;
        
        const currentValue = this.projectForm.value;
        const original = this.originalData;
        
        // Compare fields that matter
        return currentValue.name !== original.name ||
               currentValue.description !== original.description ||
               currentValue.status !== original.status ||
               currentValue.createdBy !== original.createdBy ||
               this.formatDateForComparison(currentValue.startDate) !== this.formatDateForComparison(original.startDate) ||
               this.formatDateForComparison(currentValue.endDate) !== this.formatDateForComparison(original.endDate);
    }
    
    formatDateForComparison(date: Date | null | string): string {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d instanceof Date ? d.toISOString().split('T')[0] : '';
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.projectForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    onSubmit() {
        // Verificar se o formulário é válido e, no caso de edição, se houve alterações
        if (this.projectForm.valid && (!this.isEditMode || this.formChanged)) {
            const projectData = this.projectForm.value;
            
            if (this.isEditMode) {
                const projectId = this.route.snapshot.paramMap.get('id');
                if (projectId) {
                    this.projectService.updateProject({
                        ...projectData,
                        id: projectId,
                        tasks: [], 
                        members: []
                    });
                    console.log('Projeto atualizado com sucesso:', projectData);
                }
            } else {
                this.projectService.createProject(projectData);
                console.log('Projeto criado com sucesso:', projectData);
            }
            
            const isInsideShell = window.location.port !== '4201';
            
            if (isInsideShell) {
                this.router.navigate(['/project-management']);
            } else {
                this.router.navigate(['/projects']);
            }
        } else {
            console.log('Formulário inválido ou sem alterações');
            // Marcar todos os campos como touched para exibir erros
            Object.keys(this.projectForm.controls).forEach(key => {
                const control = this.projectForm.get(key);
                control?.markAsTouched();
            });
        }
    }

    onCancel() {
        const isInsideShell = window.location.port !== '4201';
        
        if (isInsideShell) {
            this.router.navigate(['/project-management']);
        } else {
            this.router.navigate(['/projects']);
        }
    }
}
