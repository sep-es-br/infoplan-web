import { filter } from "rxjs/operators";
import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { NbSelectComponent, NbThemeService } from "@nebular/theme";
import { environment } from "../../../environments/environment";
import { IPlanejamentoOrcamentarioTotals } from "../../core/interfaces/planejamento-orcamentario/planejamento-orcamentario";

const DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS: IPlanejamentoOrcamentarioFilter =
  {
    ano: 2023,
    tipoFonte: [-1],
    uo: "",
    mes: [-1],
    po: "",
    gnd: [],
  };

interface IPlanejamentoOrcamentarioFilter {
  ano: number;
  mes: number[];
  tipoFonte: number[];
  uo: string;
  po: string;
  gnd: number[];
}

enum AvailableFilters {
  ANO = "ano",
  TIPO_FONTE = "tipoFonte",
  UO = "uo",
  PO = "po",
  GND = "gnd",
}

export enum RequestStatus {
  EMPTY = "Empty",
  LOADING = "Loading",
  SUCCESS = "Success",
  ERROR = "Error",
}

export enum AvailableThemes {
  DEFAULT = 'default',
  DARK = 'dark',
  COSMIC = 'cosmic',
};

@Component({
  selector: "ngx-planejamento-orcamentario-component",
  templateUrl: "./planejamento-orcamentario.component.html",
  styleUrls: ["./planejamento-orcamentario.component.scss"],
})
export class PlanejamentoOrcamentarioComponent implements OnInit {
  @ViewChild("modalCloseButton") modalCloseButtonRef: ElementRef;
  @ViewChildren("customSelect") customSelectRefs: QueryList<NbSelectComponent>;
  @Output() filterChanged = new EventEmitter<IPlanejamentoOrcamentarioFilter>();

  activeFilters: {
    key: string;
    label: string;
    displayValue: Array<{ name: string; fullName?: string }>;
  }[] = [];

  isFilterModalOpen: boolean = false;

  filter: IPlanejamentoOrcamentarioFilter = {
    ano: 2025,
    tipoFonte: [-1],
    mes: [-1],
    uo: "",
    po: "",
    gnd: [],
  };

  finalFilter: IPlanejamentoOrcamentarioFilter = {
    ano: 2025,
    tipoFonte: [-1],
    mes: [-1],
    uo: "",
    po: "",
    gnd: [],
  };

  yearsList = Array.from(
    { length: new Date().getFullYear() - 2014 + 1 },
    (_, i) => ({ num: 2014 + i })
  );

  requestStatus = {
    totals: RequestStatus.EMPTY,
  };

  totals: IPlanejamentoOrcamentarioTotals = {
    totalAutorizado: 0,
    totalContratado: 0,
    totalEmpenhado: 0,
    totalLiquidado: 0,
    totalPago: 0,
    totalPlanejado: 0,
    totalRestosAPagar: 0,
  };

  readonly tipoFonteList = [
    { id: 1, name: "Caixas Tesouros" },
    { id: 2, name: "Demais Fontes" },
  ];

  readonly GNDList = [
    { id: 4, name: "Investimento" },
    { id: 5, name: "Inversões Financeiras" },
  ];

  readonly monthsList = [
    { num: 1, name: "Janeiro" },
    { num: 2, name: "Fevereiro" },
    { num: 3, name: "Março" },
    { num: 4, name: "Abril" },
    { num: 5, name: "Maio" },
    { num: 6, name: "Junho" },
    { num: 7, name: "Julho" },
    { num: 8, name: "Agosto" },
    { num: 9, name: "Setembro" },
    { num: 10, name: "Outubro" },
    { num: 11, name: "Novembro" },
    { num: 12, name: "Dezembro" },
  ];

  readonly UOList = [
    { id: "35201 - DER-ES", name: "35201 - DER-ES" },
    { id: "35202 - SEAG", name: "35202 - SEAG" },
    { id: "35203 - SEINFRA", name: "35203 - SEINFRA" },
  ];

  readonly POList = [
    {
      id: "002893",
      name: "002893 - FUNDO CIDADES - MUDANÇAS CLIMÁTICAS",
    },
    {
      id: "001870",
      name: "001870 - OBRAS E SUPERVISÃO DO CAMINHOS DO CAMPO",
    },
    {
      id: "003049",
      name: "003049 - ESCOLA DO FUTURO - EQUIPAMENTOS E SERVIÇOS TECNOLÓGICOS",
    },
    {
      id: "002544",
      name: "002544 - ESPAÇO ESPORTIVO E QUADRA",
    },
    {
      id: "002873",
      name: "002873 - REABILITAÇÃO DA ES-130 - VINHÁTICO X PINHEIROS",
    },
    {
      id: "001242",
      name: "001242 - CAIS DAS ARTES",
    },
    {
      id: "002515",
      name: "002515 - OBRA DO AEROPORTO DE CACHOEIRO DE ITAPEMIRIM",
    },
    {
      id: "002453",
      name: "002453 - ES 318, TRECHO ENTR. BR-101/ENTR. ES 315 - ENTR. ES 010",
    },
    {
      id: "002056",
      name: "002056 - ES 488, ENTR. BR 101 (FRADE) – CACHOEIRO DE ITAPEMIRIM",
    },
    {
      id: "002071",
      name: "002071 - ES 230 E VARIANTES, VILA VALÉRIO - FÁTIMA",
    },
    {
      id: "002793",
      name: "002793 - ES-466 - ENTR. BR-101 X ENTR. BR-262",
    },
  ];

  currentRequestParams: IPlanejamentoOrcamentarioFilter =DEFAULT_PLANEJAENTO_ORCAMENTARIO_REQUEST_PARAMS;

  private _themeService: NbThemeService = inject(NbThemeService);

  get planejamentoLogoUrl(): string {
    const currentTheme = this._themeService.currentTheme;

        switch (currentTheme) {
          case AvailableThemes.DEFAULT:
            return 'assets/images/app/logo_SPO_engrossada.png';
          case AvailableThemes.DARK:
          case AvailableThemes.COSMIC:
            return 'assets/images/app/Ícone SPO_negativa.png';
          default:
            return 'assets/images/app/Ícone SPO_negativa.png';
        }
  }


  ngOnInit(): void {
    this.updateActiveFilters();
    this.loadInitialData();
  }

  closeFilterModal() {
    (document.activeElement as HTMLElement)?.blur();
    if (this.isFilterModalOpen) this.modalCloseButtonRef.nativeElement.click();
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: any) {
    // CORREÇÃO: Lógica melhorada para "Todos"
    if (Array.isArray(newValue)) {
      if (newValue.includes(-1)) {
        // Se selecionou "Todos", manter apenas -1
        if (origin === "mes") {
          this.filter.mes = [-1];
        } else if (origin === "tipoFonte") {
          this.filter.tipoFonte = [-1];
        }
      } else if (newValue.length > 0) {
        // Se selecionou itens específicos, remover -1 se existir
        if (origin === "mes" && this.filter.mes.includes(-1)) {
          this.filter.mes = this.filter.mes.filter((m) => m !== -1);
        } else if (
          origin === "tipoFonte" &&
          this.filter.tipoFonte.includes(-1)
        ) {
          this.filter.tipoFonte = this.filter.tipoFonte.filter((t) => t !== -1);
        }
      }
    }
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.finalFilter = {
      ano: environment.execucaoOrcamentariaFilter.ano,
      tipoFonte: environment.execucaoOrcamentariaFilter.tipoFonte,
      gnd: environment.execucaoOrcamentariaFilter.mes,
      po: environment.planjejamentoOrcamentarioFilter.po,
      mes: environment.execucaoOrcamentariaFilter.mes,
      uo: environment.planjejamentoOrcamentarioFilter.uo,
    };
    this.filter = { ...this.finalFilter };

    // CORREÇÃO: Atualizar currentRequestParams ao resetar
    this.currentRequestParams = {
      ano: this.finalFilter.ano,
      tipoFonte: this.finalFilter.tipoFonte,
      uo: this.finalFilter.uo,
      po: this.finalFilter.po,
      mes: this.finalFilter.mes,
      gnd: this.finalFilter.gnd,
    };

    this.updateActiveFilters();
  }

  updateActiveFilters() {
    this.activeFilters = [];

    // Filtro Ano
    if (this.finalFilter.ano) {
      this.activeFilters.push({
        key: "ano",
        label: "Ano",
        displayValue: [{ name: this.finalFilter.ano.toString() }],
      });
    }

    // Filtro Mês
    if (this.finalFilter.mes && this.finalFilter.mes.length >= 1) {
      if (this.finalFilter.mes.includes(-1)) {
        // this.activeFilters.push({
        //   key: 'mes',
        //   label: 'Mês',
        //   displayValue: [{ name: '' }]
        // });
      } else {
        const mesesSelecionados = this.finalFilter.mes.map((mesNum) => {
          const mes = this.monthsList.find((m) => m.num === mesNum);
          return { name: mes ? mes.name : `Mês ${mesNum}` };
        });
        this.activeFilters.push({
          key: "mes",
          label: "Mês",
          displayValue: mesesSelecionados,
        });
      }
    }

    // Filtro Tipo Fonte
    if (this.finalFilter.tipoFonte && this.finalFilter.tipoFonte.length >= 1) {
      if (this.finalFilter.tipoFonte.includes(-1)) {
        // this.activeFilters.push({
        //   key: 'tipoFonte',
        //   label: 'Tipo de Fonte',
        //   displayValue: [{ name: 'Caixas Tesouros' }]
        // });
      } else {
        const tiposSelecionados = this.finalFilter.tipoFonte.map((tipoNum) => {
          const tipo = this.tipoFonteList.find((t) => t.id === tipoNum);
          return { name: tipo ? tipo.name : `Tipo ${tipoNum}` };
        });
        this.activeFilters.push({
          key: "tipoFonte",
          label: "Tipo de Fonte",
          displayValue: tiposSelecionados,
        });
      }
    }

    if (this.finalFilter.uo && this.finalFilter.uo.length >= 1) {
      if (!this.finalFilter.uo.includes("-1")) {
        this.activeFilters.push({
          key: "uo",
          label: "UO",
          displayValue: [{ name: this.finalFilter.uo }],
        });
      }
    }

    if (this.finalFilter.po && this.finalFilter.po.length >= 1) {
      this.activeFilters.push({
        key: "po",
        label: "PO",
        displayValue: [{ name: this.finalFilter.po }],
      });
    }

    if (this.finalFilter.gnd && this.finalFilter.gnd.length >= 1) {
      const gndsSelecionados = this.finalFilter.gnd.map((gndNum) => {
        const gnd = this.GNDList.find((g) => g.id === gndNum);
        return { name: gnd ? gnd.name : `GND ${gndNum}` };
      });
      console.log(gndsSelecionados);
      this.activeFilters.push({
        key: "gnd",
        label: "GND",
        displayValue: gndsSelecionados,
      });
    }
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();
    this.closeFilterModal();
    this.finalFilter = { ...this.filter };

    // CORREÇÃO: Atualizar currentRequestParams com os filtros selecionados
    this.currentRequestParams = {
      ano: this.finalFilter.ano,
      mes: this.finalFilter.mes,
      tipoFonte: this.finalFilter.tipoFonte,
      uo: this.finalFilter.uo,
      po: this.finalFilter.po,
      gnd: this.finalFilter.gnd,
    };

    this.updateActiveFilters();

    this.filterChanged.emit(this.currentRequestParams);
  }

  loadInitialData(): void {
    this.currentRequestParams = {
      ano: this.filter.ano,
      mes: this.filter.mes,
      tipoFonte: this.filter.tipoFonte,
      uo: this.filter.uo,
      po: this.filter.po,
      gnd: this.filter.gnd,
    };

    this.filterChanged.emit(this.currentRequestParams);
  }


  formatNumber(value: number): string {
    if (!value) {
      return 'R$ 0';
    }

    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} bi`;
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })} mi`;
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} mil`;
    }

    return `R$ ${value.toLocaleString('pt-BR')}`;
  }

}
