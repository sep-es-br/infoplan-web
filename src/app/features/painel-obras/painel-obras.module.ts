import { NgModule } from "@angular/core";
import { PainelObrasComponent } from "./painel-obras.component";
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
import { TextTruncatePipe } from "../../@theme/pipes/text-truncate.pipe";
import { ThemeModule } from "../../@theme/theme.module";
import { PainelObrasRoutingModule } from "./painel-obras-rounting.module";

@NgModule({
  declarations: [PainelObrasComponent],
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
    PainelObrasRoutingModule
  ],
  exports: [PainelObrasComponent]
})
export class PainelObrasModule {}
