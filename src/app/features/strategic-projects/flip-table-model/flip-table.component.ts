import { NgFor } from "@angular/common";
import { Component, Input } from "@angular/core";
import { NbCardModule, NbIconModule } from "@nebular/theme";

@Component({
  selector: 'ngx-flip-table',
  templateUrl: './flip-table.component.html',
  styleUrls: ['./flip-table.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NbCardModule,
    NbIconModule,
  ]
})
export class FlipTableComponent {
  @Input() cardTitle: string = 'Título aqui';
  
  isFlipCardFlipped: boolean = false;

  fakeList(): Array<Number> {
    const result = [];

    for (let i = 0; i <= 1000; i++) {
      result.push(i);
    }

    return result;
  }
}