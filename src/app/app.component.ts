import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app-container {
      padding: 1rem;
      height: 100%;
      background-color: var(--surface-ground);
    }
  `]
})
export class AppComponent {
  title = 'taskflow-component';
}
