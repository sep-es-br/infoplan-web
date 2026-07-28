import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  Self,
} from "@angular/core";
import { NbAutocompleteDirective } from "@nebular/theme";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

/**
 * Mantém o autocomplete aberto para permitir seleções múltiplas consecutivas.
 *
 * Deve ser aplicado no mesmo input que contém a diretiva `nbAutocomplete`.
 */
@Directive({
  selector: "input[nbAutocomplete][ngxKeepAutocompleteOpen]",
  standalone: true,
})
export class KeepAutocompleteOpenDirective implements AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly elementRef: ElementRef<HTMLInputElement>,
    @Self()
    private readonly autocompleteDirective: NbAutocompleteDirective<unknown>,
  ) {}

  ngAfterViewInit(): void {
    this.autocompleteDirective.autocomplete.selectedChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.resetAndReopen());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resetAndReopen(): void {
    setTimeout(() => {
      const input = this.elementRef.nativeElement;

      input.value = "";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.focus();
      this.autocompleteDirective.show();
    }, 100);
  }
}
