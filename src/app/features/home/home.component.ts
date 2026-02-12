import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { menulinks } from "../../@core/utils/menuLinks";

@Component({
  selector: "ngx-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  // menulinks = menulinks;
  menulinks = menulinks.filter(item => item.status && !item.separator);

  secoes = [
    { id: "orcamento", label: "Orçamento" },
    { id: "projetos", label: "Projetos" },
    { id: "captacao", label: "Captação de Recursos" },
  ];

  constructor(private router: Router) {
    this.menulinks = this.menulinks
      .filter((item) => item.status)
      .sort((a, b) => Number(a.isExternal) - Number(b.isExternal));
  }

  // getItemsBySection(sectionId: string) {
  //   return this.menulinks.filter((item) => item.section === sectionId).sort((a, b) => a.id - b.id);
  // }

  getItemsBySection(sectionId: string) {
  return this.menulinks
    .filter((item) => item.section === sectionId && !item.separator) // ← ADICIONE !item.separator
    .sort((a, b) => a.id - b.id);
  }

  // No seu component.ts
  get groupedMenu() {
    const teste = this.menulinks
    .filter(item => !item.separator)
    .reduce(
      (acc, item) => {
        const section = item.section || "Outros";
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
      },
      {} as { [key: string]: any[] },
    );
    return teste;
  }

  get sectionNames() {
    return Object.keys(this.groupedMenu);
  }

  // handleClick(id: number) {
  //   const menuClicked = menulinks[id - 1];

  //   if (menuClicked.link != "") {
  //     this.router.navigate([menuClicked.link]);
  //   } else {
  //     if (menuClicked.url != "") {
  //       window.open(menuClicked.url, "_blank");
  //     }
  //   }
  // }

  handleClick(menuItem: any) {
  if (menuItem.link !== "") {
    this.router.navigate([menuItem.link]);
  } else if (menuItem.url !== "") {
    window.open(menuItem.url, "_blank");
  }
}
}
