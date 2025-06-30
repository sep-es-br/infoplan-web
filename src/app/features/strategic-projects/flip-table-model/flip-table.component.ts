import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { NbCardModule, NbColumnsService, NbFormFieldModule, NbIconModule, NbInputModule, NbSortDirection, NbSortRequest, NbTreeGridModule } from "@nebular/theme";

export interface TreeNode {
  data: Array<{
    originalPropertyName?: string;
    propertyName: string;
    value: any;
  }>;
  children?: Array<TreeNode>;
  expanded?: boolean;
};

export interface FlipTableContent {
  defaultColumns: Array<{
    originalPropertyName?: string;
    propertyName: string;
    displayName: string;
  }>;
  customColumn: {
    originalPropertyName?: string;
    propertyName: string;
    displayName: string;
  };
  data: Array<TreeNode>;
}

@Component({
  selector: 'ngx-flip-table',
  templateUrl: './flip-table.component.html',
  styleUrls: ['./flip-table.component.scss'],
  standalone: true,
  providers: [
    NbColumnsService,
  ],
  imports: [
    NgFor,
    NgIf,
    NgClass,
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

  @Output() executeSearch = new EventEmitter<string>();
  
  isFlipCardFlipped: boolean = false;

  isSearchFieldVisible: boolean = false;

  defaultColumnsList: Array<string> = [];

  allColumns: Array<string> = [];

  columnLabels: { [key: string]: string } = {};

  sortColumn: string;

  sortDirection: NbSortDirection = NbSortDirection.NONE;

  debounceTimer: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableContent'] && this.tableContent) {
      console.log('this.tableContent: ', this.tableContent);

      if (changes['tableContent'].previousValue) {
        // A listagem foi modificada pois os filtros aplicados mudaram

        this.allColumns = [];
        this.defaultColumnsList = [];
        this.columnLabels = {};
      }
      
      this.tableContent.defaultColumns.forEach((el) => {
        this.columnLabels[el.propertyName] = el.displayName;
        this.defaultColumnsList.push(el.propertyName);
      });

      this.columnLabels[this.tableContent.customColumn.propertyName] = this.tableContent.customColumn.displayName;

      this.allColumns = [
        this.tableContent.customColumn.propertyName,
        ...this.defaultColumnsList,
      ];
    }
  }

  handleFlipButtonClick() {
    this.isFlipCardFlipped = !this.isFlipCardFlipped
    if (!this.isFlipCardFlipped) {
      this.isSearchFieldVisible = false;
    }
  }

  getCellValue(dataObject: Array<{ propertyName: string; value: any; }>, column: string): string {
    const object = dataObject.find((el) => el.propertyName === column);

    return (object ? object.value : '--');
  }

  handleSortClick(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  getSortDirection(column: string): NbSortDirection {
    if (this.sortColumn === column) {
      return this.sortDirection;
    }
    return NbSortDirection.NONE;
  }

  getShowOn(index: number) {
    const minWithForMultipleColumns = 400;
    const nextColumnStep = 100;
    return minWithForMultipleColumns + (nextColumnStep * index);
  }

  debounceOnInput(event: KeyboardEvent) {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(() => {
      const searchTerm = (event.target as any).value;
      this.executeSearch.emit(searchTerm);
    }, 300);
  }
}