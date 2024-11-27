import { NgModule } from '@angular/core';
import { NbMenuModule } from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { HomeModule } from '../features/home/home.module';
import { LoginModule } from '../features/login/login.module';
import { StrategicProjectsModule } from '../features/strategic-projects/strategicProjects.module';

@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    MiscellaneousModule,
    HomeModule,
    StrategicProjectsModule,
    LoginModule
  ],
  declarations: [
    PagesComponent,
  ],
})
export class PagesModule {
}
