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
import { Injectable, LOCALE_ID, NgModule } from "@angular/core";
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
import { QuantidadePorStatusComponent } from './features/painel-obras/layout-painel-obras/visao-geral/data/quantidade-por-status/quantidade-por-status.component';

import { OverlayModule, ScrollStrategyOptions, NoopScrollStrategy } from "@angular/cdk/overlay";

@Injectable()
export class CustomScrollStrategyOptions extends ScrollStrategyOptions {
  override block = () => new NoopScrollStrategy() as any;
}

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
    OverlayModule,
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
    {
      provide: ScrollStrategyOptions,
      useClass: CustomScrollStrategyOptions,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
