import {
  ChangeDetectionStrategy,
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
  NbAutocompleteModule,
  NbIconModule,
  NbInputModule,
  NbTagModule,
  NbTooltipModule,
} from "@nebular/theme";
import { KeepAutocompleteOpenDirective } from "../../directives/keep-autocomplete-open.directive";

@Component({
  selector: "ngx-multi-select-autocomplete",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NbAutocompleteModule,
    NbIconModule,
    NbInputModule,
    NbTagModule,
    NbTooltipModule,
    KeepAutocompleteOpenDirective,
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
  @Input() loadingText = "Carregando opções...";

  @Output() selectedValuesChange = new EventEmitter<string[]>();

  searchTerm = "";
  filteredItems: any[] = [];
  private processingSelection = false;

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
    this.filterItems(term);
  }

  toggle(selection: any | string): void {
    if (!selection || this.processingSelection) return;

    const value = typeof selection === "string"
      ? selection
      : this.valueOf(selection);
    if (!value) return;

    this.processingSelection = true;
    const current = (this.selectedValues || []).filter(
      (selected) => selected !== "-1",
    );
    const values = current.includes(value)
      ? current.filter((selected) => selected !== value)
      : [...current, value];

    this.selectedValuesChange.emit(values);
    this.searchTerm = "";
    this.filteredItems = [...(this.items || [])];

    setTimeout(() => {
      this.processingSelection = false;
    }, 100);
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
    const maxLength = 22;

    return text.length > maxLength
      ? `${text.slice(0, maxLength - 3).trimEnd()}...`
      : text;
  }

  private filterItems(term: string): void {
    const normalizedTerm = (term || "").toLocaleLowerCase().trim();
    this.filteredItems = normalizedTerm
      ? (this.items || []).filter((item) =>
          this.displayOf(item).toLocaleLowerCase().includes(normalizedTerm),
        )
      : [...(this.items || [])];
  }
}
