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
  menu: CustomNbMenuItem[] = [];

  private lastSelectedItem: CustomNbMenuItem | undefined;

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
        if (typeof item.icon !== "string" || !item.icon.toString()) return;

        const iconName = item.icon.toString().split(".")[0];
        const isIcon = item.icon.toString().endsWith(".svg");
        if (isIcon) {
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

  // private applySectionDividers() {
  //   requestAnimationFrame(() => {
  //     // Remove divisores antigos
  //     const oldDividers = document.querySelectorAll(".menu-section-divider");
  //     oldDividers.forEach((el) => {
  //       el.remove();
  //     });

  //     const menuItems = document.querySelectorAll("nb-menu .menu-item");

  //     // Para cada item renderizado no menu
  //     menuItems.forEach((element: HTMLElement | Element, index) => {
  //       const renderedItem = this.menu[index];
  //       if (!renderedItem) return;

  //       // Encontra a posição deste item no array original (menulinks)
  //       const originalIndex = menulinks.findIndex(
  //         (item) => item.id === renderedItem.id,
  //       );

  //       // Se não é o primeiro item, verifica o item anterior no array original
  //       if (originalIndex > 0) {
  //         const previousItem = menulinks[originalIndex - 1];

  //         // Se o item anterior é um separador, insere o divisor visual
  //         if (previousItem?.separator && previousItem?.sectionTitle) {
  //           const previousElement = element.previousElementSibling;

  //           // Só insere se ainda não existe um divisor
  //           if (
  //             !previousElement ||
  //             !previousElement.classList.contains("menu-section-divider")
  //           ) {
  //             const divider = document.createElement("div");
  //             divider.className = "menu-section-divider";
  //             divider.style.opacity = "1";
  //             divider.innerHTML = `
  //               <div class="divisor">
  //                 <div class="section-title">
  //                   <span class="span-section-title">${previousItem.sectionTitle}</span>
  //                 </div>
  //               </div>
  //             `;
  //             element.parentNode.insertBefore(divider, element);
  //           }
  //         }
  //       }
  //     });
  //   });
  // }

  private applySectionDividers() {
  requestAnimationFrame(() => {
    // Remove divisores antigos
    const oldDividers = document.querySelectorAll(".menu-section-divider");
    oldDividers.forEach((el) => el.remove());

    const menuItems = document.querySelectorAll("nb-menu .menu-item");

    // Rastreia qual foi o último item processado
    let lastProcessedOriginalIndex = -1;

    menuItems.forEach((element, index) => {
      const htmlElement = element as HTMLElement;
      const renderedItem = this.menu[index];
      if (!renderedItem) return;

      // Encontra a posição deste item no array original
      const currentOriginalIndex = menulinks.findIndex(
        (item) => item.id === renderedItem.id
      );

      if (currentOriginalIndex === -1) return;

      // Procura por separadores ENTRE o último item e este item
      for (let i = lastProcessedOriginalIndex + 1; i < currentOriginalIndex; i++) {
        const betweenItem = menulinks[i];

        if (betweenItem?.separator && betweenItem?.sectionTitle) {
          // Verifica se já existe um divisor antes deste elemento
          const previousElement = htmlElement.previousElementSibling;

          if (
            !previousElement ||
            !previousElement.classList.contains("menu-section-divider")
          ) {
            const divider = document.createElement("div");
            divider.className = "menu-section-divider";
            divider.style.opacity = "1";
            divider.style.pointerEvents = "none";
            divider.innerHTML = `
              <div class="divisor">
                <div class="section-title">
                  <span class="span-section-title">${betweenItem.sectionTitle}</span>
                </div>
              </div>
            `;
            htmlElement.parentNode?.insertBefore(divider, htmlElement);

            // Para no primeiro separador encontrado
            break;
          }
        }
      }

      // Atualiza o último índice processado
      lastProcessedOriginalIndex = currentOriginalIndex;
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
    this.applySectionDividers();
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
    this.applySectionDividers();
  }

  private setIconStyles() {
    setTimeout(() => {
      const icons = Array.from(
        document.querySelectorAll<SVGElement>("nb-icon svg"),
      );
      icons.forEach((icon) => {
        icon.setAttribute("width", "20px");
        icon.setAttribute("height", "20px");

        const paths = Array.from(icon.querySelectorAll<SVGElement>("[fill]"));
        paths.forEach((path) => {
          path.setAttribute("fill", "currentColor");
        });
      });

      const imgIcons = Array.from(
        document.querySelectorAll<HTMLImageElement>("nb-icon img"),
      );
      imgIcons.forEach((img) => {
        img.style.width = "20px";
        img.style.height = "20px";
      });
    });
  }

  // private setIconStyles() {
  //   setTimeout(() => {
  //     const icons = document.querySelectorAll("nb-icon svg");
  //     icons.forEach((icon: SVGElement) => {
  //       icon.setAttribute("width", "20px");
  //       icon.setAttribute("height", "20px");

  //       const paths = icon.querySelectorAll("[fill]");
  //       paths.forEach((path: SVGElement) => {
  //         path.setAttribute("fill", "currentColor");
  //       });
  //     });

  //     const imgIcons = document.querySelectorAll("nb-icon img");
  //     imgIcons.forEach((img: HTMLImageElement) => {
  //       img.style.width = "20px";
  //       img.style.height = "20px";
  //     });
  //   });
  // }
}
