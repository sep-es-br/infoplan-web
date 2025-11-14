import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NbCardModule } from "@nebular/theme";
import { CardsComponent } from "./cards.component";

@NgModule({
  declarations: [CardsComponent],
  imports: [CommonModule, NbCardModule],
  exports: [CardsComponent],
})
export class CardsModule {}
