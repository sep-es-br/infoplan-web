import { AfterViewInit, ChangeDetectorRef, Component, HostListener, ViewChild } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';
import { HeaderComponent } from '../../components';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header #pageHeader></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive #menuSidebar>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>
    </nb-layout>
  `,
})
export class OneColumnLayoutComponent implements AfterViewInit {
  @ViewChild('menuSidebar') menuSidebar: any;

  @ViewChild('pageHeader') pageHeader: HeaderComponent;

  @HostListener('document:click', ['$event'])
  handleScreenClick(event: Event): void {
    const menuSidebarContainsClick = this.menuSidebar.element.nativeElement.contains(event.target);
    const headerContainsClick = this.pageHeader.getHeaderBoxReference().nativeElement.contains(event.target);
    
    if (
      window.innerWidth < 576 &&
      this.menuSidebar &&
      this.pageHeader &&
      !menuSidebarContainsClick &&
      !headerContainsClick
    ) {
      this.sidebarService.collapse('menu-sidebar');
      this.cdr.detectChanges();
    }
  }

  constructor(private sidebarService: NbSidebarService, private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    if (window.innerWidth < 576) {
      this.sidebarService.collapse();
    } else {
      this.sidebarService.compact('menu-sidebar');
    }
    this.cdr.detectChanges();
  }
}
