import { Location } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NbIconLibraries, NbMenuService, NbThemeService } from "@nebular/theme";
import { filter } from "rxjs/operators";
import { menulinks } from "../@core/utils/menuLinks";
import { icones } from "../core/config/icon/icone";
import { CustomNbMenuItem, MENU_ITEMS } from "./pages-menu";

@Component({
  selector: "ngx-pages",
  styleUrls: ["pages.component.scss"],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="menu" tag="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent implements OnInit {
  menu = [];
  private lastSelectedItem: CustomNbMenuItem;

  constructor(
    private iconsLibrary: NbIconLibraries,
    private nbMenuService: NbMenuService,
    private location: Location,
    private themeService: NbThemeService,
  ) {
    let currentTheme = localStorage.getItem("infoPlanCurrentTheme");
    if (currentTheme) {
      this.themeService.changeTheme(currentTheme);
    } else {
      currentTheme = this.themeService.currentTheme;
      localStorage.setItem("infoPlanCurrentTheme", currentTheme);
    }

    this.themeService
      .onThemeChange()
      .subscribe((newTheme: { name: string; previous: string }) => {
        localStorage.setItem("infoPlanCurrentTheme", newTheme.name);
      });
  }

  async ngOnInit() {
    const customIcons: { [key: string]: string } = {};

    await Promise.all(
      menulinks.map(async (item) => {
        const iconName = item.icon.toString().split(".")[0];

        if (item.icon.toString().endsWith(".svg")) {
          try {
            const response = await fetch(`assets/images/app/${item.icon}`);
            let svgContent = await response.text();

            svgContent = svgContent.replace(
              /fill="[^"]*"/g,
              'fill="currentColor"',
            );
            svgContent = svgContent.replace(
              /style="fill:[^;"]*/g,
              'style="fill:currentColor',
            );

            customIcons[iconName] = svgContent;
          } catch (error) {
            console.error(`Erro ao carregar o ícone ${item.icon}:`, error);
          }
        }
      }),
    );

    const mergedIcons = { ...customIcons, ...icones };
    this.iconsLibrary.registerSvgPack("custom-icons", mergedIcons, icones);

    this.menu = [...MENU_ITEMS].sort((a, b) => {
      return a.id - b.id;
    });

    this.setIconStyles();
    this.setInitialActiveItem();
    this.applySectionDividers();

    this.nbMenuService
      .onItemSelect()
      .pipe(filter(({ tag }) => tag === "menu"))
      .subscribe(({ item }) => {
        const menuItem = item as CustomNbMenuItem;
        if (!menuItem.isExternalUrl) {
          this.updateMenuState(menuItem);
          this.lastSelectedItem = menuItem;
        } else if (this.lastSelectedItem) {
          this.resetMenuSelection();
        }
      });
  }

  private applySectionDividers() {
    requestAnimationFrame(() => {
      const oldDividers = document.querySelectorAll(".menu-section-divider");
      oldDividers.forEach((el) => {
        el.remove();
      });

      const menuItems = document.querySelectorAll("nb-menu .menu-item");

      menuItems.forEach((element: HTMLElement, index) => {
        const menuItem = this.menu[index];

        if (menuItem?.separator && menuItem?.sectionTitle) {
          const previousElement = element.previousElementSibling;

          if (
            !previousElement ||
            !previousElement.classList.contains("menu-section-divider")
          ) {
            const divider = document.createElement("div");
            divider.className = "menu-section-divider";
            divider.style.opacity = "1";
            divider.innerHTML = `
              <div class="divisor">
                <div class="section-title">
                  <span class="span-section-title">${menuItem.sectionTitle}</span>
                </div>
              </div>
            `;
            element.parentNode.insertBefore(divider, element);
          }
        }
        // <span class="section-title">${menuItem.sectionTitle}</span>
      });
    });
  }

  private setInitialActiveItem() {
    const currentPath = this.location.path().split("?")[0];

    const activeItem = this.menu.find((item) => {
      if (!item.link) return false;
      const itemPath = item.link.startsWith("/") ? item.link : `/${item.link}`;
      return currentPath === itemPath || currentPath.startsWith(itemPath);
    });

    this.lastSelectedItem =
      activeItem || this.menu.find((item) => item.link === "/pages/home");
    this.resetMenuSelection();
  }

  private updateMenuState(activeItem: CustomNbMenuItem) {
    this.menu = this.menu.map((item) => ({
      ...item,
      selected: item.link === activeItem.link,
      expanded: item.link === activeItem.link,
    }));

    this.menu = [...this.menu];
    this.setIconStyles();
    this.applySectionDividers(); // Reaplica os divisores
  }

  private resetMenuSelection() {
    if (!this.lastSelectedItem) return;

    this.menu = this.menu.map((item) => ({
      ...item,
      selected: item.link === this.lastSelectedItem.link,
      expanded: item.link === this.lastSelectedItem.link,
    }));

    this.menu = [...this.menu];
    this.setIconStyles();
    this.applySectionDividers(); // Reaplica os divisores
  }

  private setIconStyles() {
    setTimeout(() => {
      const icons = document.querySelectorAll("nb-icon svg");
      icons.forEach((icon: SVGElement) => {
        icon.setAttribute("width", "20px");
        icon.setAttribute("height", "20px");

        const paths = icon.querySelectorAll("[fill]");
        paths.forEach((path: SVGElement) => {
          path.setAttribute("fill", "currentColor");
        });
      });

      const imgIcons = document.querySelectorAll("nb-icon img");
      imgIcons.forEach((img: HTMLImageElement) => {
        img.style.width = "20px";
        img.style.height = "20px";
      });
    });
  }
}
