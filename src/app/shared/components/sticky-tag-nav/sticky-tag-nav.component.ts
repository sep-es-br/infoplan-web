import { Observable } from 'rxjs';
import { ScrollService } from '../../../core/service/scroll.service';
import { Component, Input, OnInit } from '@angular/core';
import { NbIconModule, NbListModule, NbTagModule } from '@nebular/theme';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
export interface NavigationTag {
  label: string;
  route: string | string[];
  exact: boolean;
  visibleIn: string[]
}

@Component({
  selector: 'ngx-sticky-tag-nav',
  templateUrl: './sticky-tag-nav.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NbIconModule,
    NbTagModule,
    NbListModule,
    RouterModule
  ],
  styleUrls: ['./sticky-tag-nav.component.scss']
})
export class StickyTagNavComponent implements OnInit {
  @Input() tags: NavigationTag[] = [];

  tagsFiltradas: NavigationTag[] = [];

  isScrolled$: Observable<boolean>;

  constructor(
    private _scrollService: ScrollService,
    private router: Router) {
    this.isScrolled$ = this._scrollService.isScrolled$;
  }


  ngOnInit(): void {
    this.filtrarTagsPorRota();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.filtrarTagsPorRota();
    });
  }


  filtrarTagsPorRota() {
    const urlAtual = this.router.url;
    this.tagsFiltradas = this.tags.filter(tag => {
      if (!tag.visibleIn) return true;
      return tag.visibleIn.some((rota: string) => urlAtual.includes(rota));
    });
  }
}
