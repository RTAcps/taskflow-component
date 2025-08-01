import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponentComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponentComponent, appConfig)
  .catch(err => console.error(err));
