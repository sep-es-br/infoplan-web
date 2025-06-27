import { NgFor, NgIf } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { NbCardModule, NbFormFieldModule, NbIconModule, NbInputModule, NbTreeGridModule } from "@nebular/theme";

export interface FlipTableContent {
  columns: Array<{
    propertyName: string;
    displayName: string;
  }>;
  lines: Array<Object>;
  numOfColumns?: Number;
}

@Component({
  selector: 'ngx-flip-table',
  templateUrl: './flip-table.component.html',
  styleUrls: ['./flip-table.component.scss'],
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NbCardModule,
    NbIconModule,
    NbInputModule,
    NbFormFieldModule,
    NbTreeGridModule,
  ]
})
export class FlipTableComponent implements OnChanges {
  @Input() cardTitle: string = 'Título aqui';

  @Input() tableContent: FlipTableContent;
  
  isFlipCardFlipped: boolean = false;

  isSearchFieldVisible: boolean = false;

  allColumns = ['Coluna 1', 'Coluna 2', 'Coluna 3'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableContent'] && this.tableContent) {
      if (!this.tableContent.numOfColumns) {
        this.tableContent.numOfColumns = this.tableContent.columns.length;
      }
    }
  }

  handleFlipButtonClick() {
    this.isFlipCardFlipped = !this.isFlipCardFlipped
    if (!this.isFlipCardFlipped) {
      this.isSearchFieldVisible = false;
    }
  }

  handleInputSearchChange(event: KeyboardEvent) {
    console.log('newValue: ', (event.target as any).value);
  }
}