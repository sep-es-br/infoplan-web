import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  NbIconModule,
  NbSelectWithAutocompleteModule,
  NbTagModule,
  NbTooltipModule,
} from "@nebular/theme";

@Component({
  selector: "ngx-multi-select-autocomplete",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbSelectWithAutocompleteModule,
    NbIconModule,
    NbTagModule,
    NbTooltipModule,
  ],
  templateUrl: "./multi-select-autocomplete.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectAutocompleteComponent implements OnChanges {
  @Input() label = "";
  @Input() placeholder = "Buscar...";
  @Input() name = "multiSelectAutocomplete";
  @Input() items: any[] = [];
  @Input() selectedValues: string[] = [];
  @Input() valueKey = "value";
  @Input() labelKey = "label";
  @Input() loading = false;
  @Input() disabled = false;
  @Input() chipMaxLength = 22;
  @Input() loadingText = "Carregando opções...";

  @Output() selectedValuesChange = new EventEmitter<string[]>();

  searchTerm = "";
  filteredItems: any[] = [];

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}
  get selectedItems(): any[] {
    const selected = new Set(this.selectedValues || []);
    return (this.items || []).filter((item) =>
      selected.has(this.valueOf(item)),
    );
  }

  get inputPlaceholder(): string {
    return this.loading ? "Carregando..." : this.placeholder;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.items) {
      this.filterItems(this.searchTerm);
    }
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.filterItems(term);
    this.changeDetectorRef.markForCheck();
  }

  onSelectionChange(values: string[]): void {
    this.selectedValuesChange.emit(
      (values || []).map(String).filter((value) => value !== "-1"),
    );
  }

  remove(value: string): void {
    this.selectedValuesChange.emit(
      (this.selectedValues || []).filter(
        (selected) => selected !== value && selected !== "-1",
      ),
    );
  }

  isSelected(item: any): boolean {
    return (this.selectedValues || []).includes(this.valueOf(item));
  }

  trackByValue = (_index: number, item: any): string => this.valueOf(item);

  isSearchMatch(item: any): boolean {
    const normalizedTerm = this.normalizeSearchText(this.searchTerm);
    return !normalizedTerm ||
      this.normalizeSearchText(this.displayOf(item)).includes(normalizedTerm);
  }

  valueOf(item: any): string {
    return String(item?.[this.valueKey] ?? "");
  }

  descriptionOf(item: any): string {
    return String(item?.[this.labelKey] ?? "");
  }

  displayOf(item: any): string {
    const value = this.valueOf(item);
    const description = this.descriptionOf(item);
    return description ? `${value} - ${description}` : value;
  }

  chipDisplayOf(item: any): string {
    const text = this.displayOf(item);
    const maxLength = Math.max(this.chipMaxLength, 4);

    return text.length > maxLength
      ? `${text.slice(0, maxLength - 3).trimEnd()}...`
      : text;
  }

  private filterItems(term: string): void {
    const normalizedTerm = this.normalizeSearchText(term);
    this.filteredItems = normalizedTerm
      ? (this.items || []).filter((item) =>
          this.normalizeSearchText(this.displayOf(item)).includes(normalizedTerm) ||
          this.isSelected(item),
        )
      : [...(this.items || [])];
  }

  private normalizeSearchText(value: string): string {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("pt-BR")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
}
