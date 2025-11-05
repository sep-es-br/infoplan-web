import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NbDatepickerModule, NbIconModule } from "@nebular/theme";

// filter-config.interface.ts
export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'date-range' | 'text' | 'number';
  placeholder?: string;
  options?: { value: any; label: string; disabled?: boolean }[];
  multiple?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  hidden?: boolean;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
  };
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: any;
  displayValue: string;
  type: string;
}

@Component({
  selector: "ngx-app-filter",
  templateUrl: "./filter.component.html",
  styleUrls: ["./filter.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbIconModule,
    NbDatepickerModule
  ],
})
export class FilterComponent implements OnInit {
  @Input() filterConfigs: FilterConfig[] = [];
  @Input() activeFilters: ActiveFilter[] = [];
  @Input() showMapButton: boolean = false;
  @Input() isMapOpen: boolean = false;

  @Output() filterChange = new EventEmitter<any>();
  @Output() filterRemove = new EventEmitter<string>();
  @Output() filterReset = new EventEmitter<void>();
  @Output() mapToggle = new EventEmitter<boolean>();

  filterModel: any = {};
  showFilters: boolean = false;

  ngOnInit() {
    this.initializeFilterModel();
  }

  private initializeFilterModel() {
    this.filterConfigs.forEach(config => {
      this.filterModel[config.key] = config.multiple ? [] : null;
    });
  }

  handleFilterChange(key: string, value: any) {
    this.filterModel[key] = value;
  }

  removeFilter(key: string) {
    this.filterRemove.emit(key);

    // Resetar o valor no modelo
    const config = this.getFilterConfig(key);
    if (config) {
      this.filterModel[key] = config.multiple ? [] : null;
    }
  }

  resetFilters() {
    this.initializeFilterModel();
    this.filterReset.emit();
  }

  applyFilters() {
    const filters = this.buildFilters();
    this.filterChange.emit(filters);
    this.closeFilterModal();
  }

  private buildFilters(): any {
    const filters: any = {};

    this.filterConfigs.forEach(config => {
      const value = this.filterModel[config.key];
      if (value && (config.multiple ? value.length > 0 : value !== null && value !== '')) {
        filters[config.key] = value;
      }
    });

    return filters;
  }

  getFilterConfig(key: string): FilterConfig | undefined {
    return this.filterConfigs.find(config => config.key === key);
  }

  openFilterModal() {
    this.showFilters = true;
  }

  closeFilterModal() {
    this.showFilters = false;
  }

  toggleMap() {
    this.isMapOpen = !this.isMapOpen;
    this.mapToggle.emit(this.isMapOpen);
  }

  // MÉTODO ADICIONADO PARA CORRIGIR O ERRO
  getFilterRows(): FilterConfig[][] {
    const rows: FilterConfig[][] = [];
    let currentRow: FilterConfig[] = [];

    this.filterConfigs.forEach((config, index) => {
      currentRow.push(config);

      // 4 filtros por linha (col-xl-3)
      if ((index + 1) % 4 === 0 || index === this.filterConfigs.length - 1) {
        rows.push(currentRow);
        currentRow = [];
      }
    });

    return rows;
  }
}
