import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  NbAutocompleteModule,
  NbButtonModule,
  NbCardModule,
  NbIconModule,
  NbLayoutModule,
  NbSelectModule,
  NbTagModule,
} from "@nebular/theme";
import { FormsModule } from "@angular/forms";
import { TextTruncatePipe } from "../../../@theme/pipes/text-truncate.pipe";
import { ThemeModule } from "../../../@theme/theme.module";
import { LayoutPainelObrasRoutingModule } from "./layout-painel-obras-rounting.module";

@NgModule({
  imports: [
    CommonModule,
    NbIconModule,
    NbLayoutModule,
    FormsModule,
    NbButtonModule,
    NbSelectModule,
    NbCardModule,
    TextTruncatePipe,
    NbLayoutModule,
    ThemeModule,
    NbAutocompleteModule,
    NbTagModule,
    LayoutPainelObrasRoutingModule
  ],
})
export class LayoutPainelObrasModule {}
