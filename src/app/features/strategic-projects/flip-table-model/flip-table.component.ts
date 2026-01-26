import { NgClass, NgFor, NgIf } from "@angular/common";
import {
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  HostBinding,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  NbBadgeModule,
  NbCardModule,
  NbColumnsService,
  NbFormFieldModule,
  NbIconModule,
  NbInputModule,
  NbSortDirection,
  NbSortRequest,
  NbSpinnerModule,
  NbTooltipModule,
  NbTreeGridModule,
} from "@nebular/theme";
import { TextTruncatePipe } from "../../../@theme/pipes/text-truncate.pipe";
import { RequestStatus } from "../strategicProjects.component";
import { ShortNumberPipe } from "../../../shared/components/pipe/shortNumber-pipe";

export interface TreeNode {
  data: Array<{
    originalPropertyName?: string;
    propertyName: string;
    value: any;
  }>;
  children?: Array<TreeNode>;
  expanded?: boolean;
}

export enum FlipTableAlignment {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
}

export interface FlipTableColumn {
  originalPropertyName?: string;
  propertyName: string;
  displayName: string;
  alignment?: {
    header: FlipTableAlignment;
    data: FlipTableAlignment;
  };
  enableEventClick?: boolean;
}

export interface FlipTableContent {
  defaultColumns: Array<FlipTableColumn>;
  customColumn: FlipTableColumn;
  data: Array<TreeNode>;
}

export interface FlipTableCustomStyles {
  cardFront?: {};
  cardBack?: {
    verticalAlignTable?: boolean;
  };
}
@Component({
  selector: "ngx-flip-table",
  templateUrl: "./flip-table.component.html",
  styleUrls: ["./flip-table.component.scss"],
  standalone: true,
  providers: [NbColumnsService, ShortNumberPipe],
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
    NbBadgeModule,
  ],
})
export class FlipTableComponent implements OnChanges {
  @Input() cardTitle: string;

  @Input() subCardTitle!: string;

  @Input() tableContent: FlipTableContent;

  @Input() backCardHeight: number = 150;

  @Input() customTableStyles: FlipTableCustomStyles = {
    cardBack: {
      verticalAlignTable: true,
    },
  };

  @Input() showTableIcon: boolean = true;

  @Input() loadingStatus: RequestStatus = RequestStatus.LOADING;

  @Output() executeSearch = new EventEmitter<string>();

  @Output() executeDownload = new EventEmitter<any>();

  @Output() executeCustomFiltering = new EventEmitter<string>();

  @Output()
  searchFieldVisibilityChange = new EventEmitter<boolean>();

  @Input() showSearchField: boolean;

  @Input() showMaximizeButton: boolean = false;

  @Input() height: number = 400;

  @Input() outerCardHeight: number;

  @ContentChild("cardToggles", { read: ElementRef }) cardTogglesRef: ElementRef;

  get hasToggleContent(): boolean {
    return !!this.cardTogglesRef;
  }

  @HostBinding("class.maximized") get maximizedClass() {
    return this.isMaximized;
  }

  @HostBinding("class.minimized") get minimizedClass() {
    return !this.isMaximized;
  }

  @HostBinding("style.height.px") get componentHeight(): number {
    if (this.isMaximized) {
      return window.innerHeight - 50;
    } else {
      return this.height || 100;
    }
  }

  get tableHeight(): number {
    // Altura da tabela é um pouco menor que o container para dar margem
    if (this.isMaximized) {
      return window.innerHeight - 80; // menos espaço para headers/borders
    } else {
      return (this.height || 400) - 30;
    }
  }

  @Output() showMaximizeButtonClick: EventEmitter<boolean> =
    new EventEmitter<boolean>();

  private readonly _shortNumber = inject(ShortNumberPipe);

  isMaximized = false;
  isFlipCardFlipped: boolean = false;

  isSearchFieldVisible: boolean = false;

  defaultColumnsList: Array<FlipTableColumn> = [];

  allColumns: Array<FlipTableColumn> = [];

  columnLabels: { [key: string]: string } = {};

  sortColumn: string;

  sortDirection: NbSortDirection = NbSortDirection.NONE;

  debounceTimer: any;

  constructor(private cdr: ChangeDetectorRef) {}

  get allColumnsNames(): Array<string> {
    return this.allColumns.map((el) => el.propertyName);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["tableContent"] && this.tableContent) {
      if (changes["tableContent"].previousValue) {
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
            header: el.alignment
              ? el.alignment.header
              : FlipTableAlignment.LEFT,
            data: el.alignment ? el.alignment.data : FlipTableAlignment.LEFT,
          },
        });
      });

      this.columnLabels[this.tableContent.customColumn.propertyName] =
        this.tableContent.customColumn.displayName;

      const customColumn = this.tableContent.customColumn;
      this.allColumns = [
        {
          propertyName: customColumn.propertyName,
          displayName: customColumn.displayName,
          alignment: {
            header: customColumn.alignment
              ? customColumn.alignment.header
              : FlipTableAlignment.LEFT,
            data: customColumn.alignment
              ? customColumn.alignment.data
              : FlipTableAlignment.LEFT,
          },
        },
        ...this.defaultColumnsList,
      ];
    }
  }

  /* Handlers */

  handleCloseSearchFieldClick() {
    this.isSearchFieldVisible = false;
    this.cdr.detectChanges();
    this.executeSearch.emit("");
  }

  handleDownloadButtonClick() {
    this.executeDownload.emit();
  }

  handleFlipButtonClick() {
    this.isFlipCardFlipped = !this.isFlipCardFlipped;
    if (!this.isFlipCardFlipped) {
      this.isSearchFieldVisible = false;
      this.cdr.detectChanges();
    }
  }

  handleSortClick(sortRequest: NbSortRequest): void {
    this.sortColumn = sortRequest.column;
    this.sortDirection = sortRequest.direction;
  }

  handleCustomColumnClick(value: string) {
    this.executeCustomFiltering.emit(value);
  }

  getCellValue(
    dataObject: Array<{ propertyName: string; value: any }>,
    column: string,
  ): string {
    const object = dataObject.find((el) => el.propertyName === column);
    return object ? object.value : "";
  }

  getCellValueShort(
    dataObject: Array<{ propertyName: string; value: any }>,
    column: string,
  ): string {
    const object = dataObject.find((el) => el.propertyName === column);

    if (!object || !object.value) {
      return "";
    }

    const value = object.value;

    // ✅ Verifica se tem R$ - só processa se tiver
    const isString = typeof value === "string";
    const hasRealSymbol = isString && value.includes("R$");

    // Se não tem R$, retorna o valor original
    if (!hasRealSymbol) {
      return value;
    }

    // Limpa o valor sem regex
    let cleanedValue = value;
    cleanedValue = cleanedValue.split("R$").join(""); // Remove R$
    cleanedValue = cleanedValue.split(" ").join(""); // Remove espaços
    cleanedValue = cleanedValue.split(".").join(""); // Remove pontos de milhar
    cleanedValue = cleanedValue.split(",").join("."); // Converte vírgula em ponto

    const numValue = Number(cleanedValue);

    // Se não conseguiu converter, retorna original
    if (isNaN(numValue)) {
      return value;
    }

    // ✅ Se for zero, retorna apenas "0,00"
    if (numValue === 0) {
      return "0,00";
    }

    // ========================================
    // LÓGICA DE ABREVIAÇÃO
    // ========================================
    const absValue = Math.abs(numValue);

    // Números menores que 1000 não precisam abreviação
    if (absValue < 1000) {
      const formatted = numValue.toFixed(2).split(".").join(",");
      return `R$ ${formatted}`;
    }

    // Define unidade e divisor
    let divisor = 1;
    let suffix = "";

    if (absValue >= 1e12) {
      divisor = 1e12;
      suffix = "T";
    } else if (absValue >= 1e9) {
      divisor = 1e9;
      suffix = "B";
    } else if (absValue >= 1e6) {
      divisor = 1e6;
      suffix = "M";
    } else if (absValue >= 1e3) {
      divisor = 1e3;
      suffix = "K";
    }

    const scaled = numValue / divisor;

    // Formata com 1 casa decimal
    let formatted = scaled.toFixed(1);

    // Remove zeros desnecessários: "1.0" vira "1"
    while (
      formatted.includes(".") &&
      (formatted.endsWith("0") || formatted.endsWith("."))
    ) {
      if (formatted.endsWith("0")) {
        formatted = formatted.slice(0, -1);
      }
      if (formatted.endsWith(".")) {
        formatted = formatted.slice(0, -1);
      }
    }

    formatted = formatted.split(".").join(",");

    return `${formatted}${suffix}`;
  }

  isRowTotal(row: TreeNode): boolean {
    return row.data.some(
      (prop) => prop.propertyName === "categoria" && prop.value === "Total",
    );
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
    return minWithForMultipleColumns + nextColumnStep * index;
  }

  /* Auxiliares */

  debounceOnInput(event: KeyboardEvent) {
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      const searchTerm = (event.target as any).value;
      this.executeSearch.emit(searchTerm);
    }, 300);
  }

  handleMaximizeButtonClick() {
    this.isMaximized = !this.isMaximized; // Alterna o estado
    this.showMaximizeButtonClick.emit(this.isMaximized); // Emite o estado atual
    this.cdr.detectChanges();
  }
}
