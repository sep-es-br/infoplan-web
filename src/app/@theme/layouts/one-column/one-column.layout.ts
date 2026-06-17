import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  ViewChild,
} from "@angular/core";
import { NbSidebarService } from "@nebular/theme";
import { HeaderComponent } from "../../components";

@Component({
  selector: "ngx-one-column-layout",
  styleUrls: ["./one-column.layout.scss"],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header #pageHeader></ngx-header>
      </nb-layout-header>

      <!-- <div class="divider">teste</div> -->

      <nb-sidebar
        class="menu-sidebar"
        tag="menu-sidebar"
        #menuSidebar
      >
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent implements AfterViewInit {
  @ViewChild("menuSidebar") menuSidebar: any;

  @ViewChild("pageHeader") pageHeader: HeaderComponent;

  private touchStartX: number = 0;
  private touchEndX: number = 0;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (window.innerWidth < 576 && event.changedTouches.length > 0) {
      this.touchStartX = event.changedTouches[0].screenX;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (window.innerWidth < 576 && event.changedTouches.length > 0) {
      this.touchEndX = event.changedTouches[0].screenX;
      this.handleSwipe();
    }
  }

  private handleSwipe(): void {
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    // Se arrastou para a esquerda em pelo menos 50px, fecha o menu
    if (swipeDistance > 50) {
      this.sidebarService.collapse("menu-sidebar");
      this.cdr.detectChanges();
    }
    // Se arrastou para a direita em pelo menos 50px (valor negativo)
    // E o toque começou bem no canto esquerdo da tela (ex: nos primeiros 40px)
    else if (swipeDistance < -50 && this.touchStartX < 40) {
      this.sidebarService.expand("menu-sidebar");
      this.cdr.detectChanges();
    }
  }

  @HostListener("document:click", ["$event"])
  handleScreenClick(event: Event): void {
    const menuSidebarContainsClick =
      this.menuSidebar.element.nativeElement.contains(event.target);
    const headerContainsClick = this.pageHeader
      .getHeaderBoxReference()
      .nativeElement.contains(event.target);

    if (
      window.innerWidth < 576 &&
      this.menuSidebar &&
      this.pageHeader &&
      !menuSidebarContainsClick &&
      !headerContainsClick
    ) {
      this.sidebarService.collapse("menu-sidebar");
      this.cdr.detectChanges();
    }
  }

  constructor(
    private sidebarService: NbSidebarService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    if (window.innerWidth < 576) {
      this.sidebarService.collapse();
    } else {
      this.sidebarService.compact("menu-sidebar");
    }
    this.cdr.detectChanges();
  }
}
