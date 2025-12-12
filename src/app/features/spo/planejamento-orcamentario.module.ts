import { CommonModule } from '@angular/common';
import { PlanejamentoOrcamentarioComponent } from './planejamento-orcamentario.component';
import { NgModule } from "@angular/core";
import { NbButtonModule, NbCardModule, NbIconModule, NbSelectModule } from '@nebular/theme';
import { FormsModule } from '@angular/forms';
import { TextTruncatePipe } from '../../@theme/pipes/text-truncate.pipe';

@NgModule({
  declarations: [PlanejamentoOrcamentarioComponent],
  imports: [
    CommonModule,
    FormsModule,
    NbButtonModule,
    NbIconModule,
    NbSelectModule,
    NbCardModule,
    TextTruncatePipe
  ],
})

export class PlanejamentoOrcamentarioModule {}
