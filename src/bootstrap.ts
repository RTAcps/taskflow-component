import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appComponentConfig } from './app/app.config';

bootstrapApplication(AppComponent, appComponentConfig)
  .catch(err => console.error(err));
