/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import {
  HttpClientModule,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  NbCardModule,
  NbChatModule,
  NbDatepickerModule,
  NbDialogModule,
  NbLayoutModule,
  NbMenuModule,
  NbSidebarModule,
  NbToastrModule,
  NbWindowModule,
} from "@nebular/theme";
import { NgxEchartsModule } from "ngx-echarts";
import { CoreModule } from "./@core/core.module";
import { ThemeModule } from "./@theme/theme.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { authInterceptor } from "./core/interceptors/auth.interceptor";

import { registerLocaleData } from "@angular/common";
import ptBr from "@angular/common/locales/pt";
import { LOCALE_ID } from "@angular/core";
import { PainelObrasComponent } from './features/painel-obras/painel-obras.component';

registerLocaleData(ptBr);
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NbSidebarModule.forRoot(),
    NbMenuModule.forRoot(),
    NbDatepickerModule.forRoot(),
    NbDialogModule.forRoot(),
    NbWindowModule.forRoot(),
    NbToastrModule.forRoot(),
    NbChatModule.forRoot({
      messageGoogleMapKey: "AIzaSyA_wNuCzia92MAmdLRzmqitRGvCF7wCZPY",
    }),
    CoreModule.forRoot(),
    ThemeModule.forRoot(),
    NgxEchartsModule.forRoot({
      echarts: () => import("echarts"),
    }),
    NbDatepickerModule.forRoot(),
    NbCardModule,
    NbLayoutModule,
  ],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: "pt-BR" },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
