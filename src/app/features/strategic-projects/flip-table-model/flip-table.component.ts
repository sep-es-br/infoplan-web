import { NgClass, NgFor, NgIf } from "@angular/common";
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { NbCardModule, NbColumnsService, NbFormFieldModule, NbIconModule, NbInputModule, NbSortDirection, NbSortRequest, NbSpinnerModule, NbTooltipModule, NbTreeGridModule } from "@nebular/theme";
import { TextTruncatePipe } from "../../../@theme/pipes/text-truncate.pipe";
import { RequestStatus } from "../strategicProjects.component";

export interface TreeNode {
  data: Array<{
    originalPropertyName?: string;
    propertyName: string;
    value: any;
  }>;
  children?: Array<TreeNode>;
  expanded?: boolean;
};

export enum FlipTableAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

interface FlipTableColumn {
  originalPropertyName?: string;
  propertyName: string;
  displayName: string;
  alignment?: {
    header: FlipTableAlignment;
    data: FlipTableAlignment;
  };
}

export interface FlipTableContent {
  defaultColumns: Array<FlipTableColumn>;
  customColumn: FlipTableColumn;
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
    NbTooltipModule,
    TextTruncatePipe,
    NbSpinnerModule,
  ]
})
export class FlipTableComponent implements OnChanges {
  @Input() cardTitle: string;

  @Input() tableContent: FlipTableContent;

  @Input() backCardHeight: number = 150;

  @Input() loadingStatus: RequestStatus = RequestStatus.LOADING;

  @Output() executeSearch = new EventEmitter<string>();

  @Output() executeDownload = new EventEmitter<any>();
  
  isFlipCardFlipped: boolean = false;

  isSearchFieldVisible: boolean = false;

  defaultColumnsList: Array<FlipTableColumn> = [];

  allColumns: Array<FlipTableColumn> = [];

  columnLabels: { [key: string]: string } = {};

  sortColumn: string;

  sortDirection: NbSortDirection = NbSortDirection.NONE;

  debounceTimer: any;

  get allColumnsNames(): Array<string> {
    return this.allColumns.map((el) => el.propertyName);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tableContent'] && this.tableContent) {
      if (changes['tableContent'].previousValue) {
        // A listagem foi modificada pois os filtros aplicados mudaram

        this.allColumns = [];
        this.defaultColumnsList = [];
        this.columnLabels = {};
      }
      
      this.tableContent.defaultColumns.forEach((el) => {
        this.columnLabels[el.propertyName] = el.displayName;
        this.defaultColumnsList.push({
          propertyName: el.propertyName,
          displayName: el.displayName,
          alignment: {
            header: el.alignment ? el.alignment.header : FlipTableAlignment.LEFT,
            data: el.alignment ? el.alignment.data : FlipTableAlignment.LEFT,
          },
        });
      });

      this.columnLabels[this.tableContent.customColumn.propertyName] = this.tableContent.customColumn.displayName;

      const customColumn = this.tableContent.customColumn;
      this.allColumns = [
        {
          propertyName: customColumn.propertyName,
          displayName: customColumn.displayName,
          alignment: {
            header: customColumn.alignment ? customColumn.alignment.header : FlipTableAlignment.LEFT,
            data: customColumn.alignment ? customColumn.alignment.data : FlipTableAlignment.LEFT,
          },
        },
        ...this.defaultColumnsList,
      ];
    }
  }

  /* Handlers */

  handleCloseSearchFieldClick() {
    this.isSearchFieldVisible = false;
    this.executeSearch.emit('');
  }

  handleDownloadButtonClick() {
    this.executeDownload.emit();
  }

  handleFlipButtonClick() {
    this.isFlipCardFlipped = !this.isFlipCardFlipped
    if (!this.isFlipCardFlipped) {
      this.isSearchFieldVisible = false;
    }
  }

  handleSortClick(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  /* Getters */

  getCellValue(dataObject: Array<{ propertyName: string; value: any; }>, column: string): string {
    const object = dataObject.find((el) => el.propertyName === column);

    return (object ? object.value : '');
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

  /* Auxiliares */

  debounceOnInput(event: KeyboardEvent) {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(() => {
      const searchTerm = (event.target as any).value;
      this.executeSearch.emit(searchTerm);
    }, 300);
  }
}