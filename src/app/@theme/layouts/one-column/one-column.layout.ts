import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NbSidebarService } from '@nebular/theme';

@Component({
  selector: 'ngx-one-column-layout',
  styleUrls: ['./one-column.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <ngx-header></ngx-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>


    </nb-layout>
  `,
})
export class OneColumnLayoutComponent implements AfterViewInit {
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
