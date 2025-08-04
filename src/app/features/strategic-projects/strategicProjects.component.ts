import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StrategicProjectsService } from '../../core/service/strategic-projects.service';
import { IIdAndName } from '../../core/interfaces/id-and-name.interface';
import { IStrategicProjectFilterDataDto, IStrategicProjectFilterValuesDto } from '../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectTotals } from '../../core/interfaces/strategic-project-totals.interface';
import { IStrategicProjectTimestamp } from '../../core/interfaces/strategic-project.interface';
import { NbThemeService } from '@nebular/theme';
import { AvailableThemes } from '../../@theme/theme.module';
import { BehaviorSubject } from 'rxjs';

enum AvailableFilters {
  PORTFOLIO = 'Portfolio',
  DATA_INICIAL = 'Data_Inicial',
  DATA_FINAL = 'Data_Final',
  PREVISAO_CONCLUSAO = 'Previsao_Conclusao',
  AREAS_TEMATICAS = 'Areas_Tematicas',
  PROGRAMAS_ORIGINAIS = 'Programas_Originais',
  PROJETOS = 'Projetos',
  ENTREGAS = 'Entregas',
  PROGRAMAS_TRANSVERSAIS = 'Programas_Transversais',
  LOCALIDADES = 'Localidades',
  ORGAOS = 'Orgaos',
  ACOMPANHADO_POR = 'Acompanhado_Por',
}

export enum RequestStatus {
  EMPTY = 'Empty',
  LOADING = 'Loading',
  SUCCESS = 'Success',
  ERROR = 'Error',
}

export interface CustomTableFilteringTrigger {
  source: 'InvestmentBy' | 'DeliveriesBy';
  newSelectedEntity: 'Área Temática' | 'Programa' | 'Programas Transversais' | 'Projeto' | 'Entrega';
}

export interface StrategicProjectsFilter {
  portfolio: string,
  dataInicio: string,
  dataFim: string,
  previsaoConclusao: string,
  areaTematica?: Array<Number>,
  programaOrigem?: Array<Number>,
  projetos?: Array<Number>,
  entregas?: Array<Number>,
  programaTransversal?: Array<Number>,
  localidades?: Array<Number>,
  orgaos?: Array<Number>,
  acompanhamentos?: Array<Number>,
}

@Component({
  selector: 'ngx-strategic-projects',
  templateUrl: './strategicProjects.component.html',
  styleUrls: ['./strategicProjects.component.scss']
})
export class StrategicProjectsComponent {
  @ViewChild('modalCloseButton') modalCloseButtonRef: ElementRef;

  @HostListener('show.bs.modal')
  onModalOpen() {
    this.isFilterModalOpen = true;
  }

  @HostListener('hide.bs.modal')
  onModalClose() {
    this.isFilterModalOpen = false;
  }

  timestamp: string;

  isMapOpen = false;

  totals: IStrategicProjectTotals = {
    qdeProgramas: 0,
    qdeProjetos: 0,
    totalEntregasPE: 0,
    totalPrevisto: 0,
    totalRealizado: 0,
  };

  filter: StrategicProjectsFilter = {
    portfolio: environment.strategicProjectFilter.portfolio,
    dataInicio: environment.strategicProjectFilter.dataInicio,
    dataFim: environment.strategicProjectFilter.dataFim,
    previsaoConclusao: '',
    areaTematica: [],
    programaOrigem: [],
    projetos: [],
    entregas: [],
    programaTransversal: [],
    localidades: [],
    orgaos: [],
    acompanhamentos: [],
  };

  finalFilter: StrategicProjectsFilter = {
    portfolio: environment.strategicProjectFilter.portfolio,
    dataInicio: environment.strategicProjectFilter.dataInicio,
    dataFim: environment.strategicProjectFilter.dataFim,
    previsaoConclusao: '',
    areaTematica: [],
    programaOrigem: [],
    projetos: [],
    entregas: [],
    programaTransversal: [],
    localidades: [],
    orgaos: [],
    acompanhamentos: [],
  };

  dateController = {
    mesInicial: environment.strategicProjectFilter.dataInicio.slice(5, 7),
    anoInicial: environment.strategicProjectFilter.dataInicio.slice(0, 4),
    mesFinal: environment.strategicProjectFilter.dataFim.slice(5, 7),
    anoFinal: environment.strategicProjectFilter.dataFim.slice(0, 4),
  };

  areaList: IIdAndName[] = [];
  programaOList: IIdAndName[] = [];
  programaTList: IIdAndName[] = [];
  entregaList: IIdAndName[] = [];
  orgaoList: IIdAndName[] = [];
  localidadeList: IIdAndName[] = [];
  projetoList: IIdAndName[] = [];
  monthsList = [
    { num: '01', name: 'Janeiro' },
    { num: '02', name: 'Fevereiro' },
    { num: '03', name: 'Março' },
    { num: '04', name: 'Abril' },
    { num: '05', name: 'Maio' },
    { num: '06', name: 'Junho' },
    { num: '07', name: 'Julho' },
    { num: '08', name: 'Agosto' },
    { num: '09', name: 'Setembro' },
    { num: '10', name: 'Outubro' },
    { num: '11', name: 'Novembro' },
    { num: '12', name: 'Dezembro' }
  ];

  activeFilters: { key: string; label: string; displayValue: Array<{name: string; fullName?: string; }>; }[] = [];

  requestStatus = {
    totals: RequestStatus.EMPTY,
  }

  tableFilteringTrigger = new BehaviorSubject<CustomTableFilteringTrigger>(null);

  isFilterModalOpen: boolean = false;

  get yearsList(): Array<string> {
    return Array.from({ length: 10 }, (_, index) => (2020 + index).toString());
  }

  constructor(private strategicProjectsService: StrategicProjectsService, private themeService: NbThemeService) {
    this.loadTimestamp();
    this.updateActiveFilters();
    this.loadAll();
    this.loadTotals();
  }

  get portfolioLogoUrl(): string {
    const currentTheme = this.themeService.currentTheme;
    switch (currentTheme) {
      case AvailableThemes.DEFAULT:
        return 'assets/images/app/realiza+_transparente.png';
      case AvailableThemes.DARK:
      case AvailableThemes.COSMIC:
        return 'assets/images/app/realiza+ full_white.png';
      default:
        return 'assets/images/app/realiza+_transparente.png';
    }
  }

  updateActiveFilters() {
    const directValueKeys = ['portfolio', 'dataInicio', 'dataFim', 'previsaoConclusao'];
    const optionsMapping = {
      areaTematica: 'areaList',
      programaOrigem: 'programaOList',
      programaTransversal: 'programaTList',
      entregas: 'entregaList',
      localidades: 'localidadeList',
      orgaos: 'orgaoList',
      projetos: 'projetoList',
      acompanhamentos: 'acompanhamentoList'
    };

    this.activeFilters = Object.entries(this.finalFilter)
      .filter(([key, value]) => value && (Array.isArray(value) ? value.length > 0 : true))
      .map(([key, value]) => {
        let displayValue: Array<{name: string; fullName?: string; }>;

        if (directValueKeys.includes(key)) {
          if (key === 'dataInicio' || key === 'dataFim') {
            const year = value.slice(0, 4);
            const month = value.slice(5, 7);
            displayValue = [{ name: `${month}-${year}` }];
          } else {
            displayValue = [{ name: (value as string) }];
          }
        } else {
          const listKey = optionsMapping[key];
          const list = this[listKey as keyof this] as IIdAndName[];

          if (Array.isArray(value)) {
            displayValue = value.map((selectedItem, index) => {
              const item = list?.find((item) => item.id === selectedItem) || selectedItem;
              let name: string = item.name;
              if (index + 1 < value.length) {
                name = `${name}`;
              }
              return { name, fullName: item?.fullName || name };
            });
          } else {
            const item = list?.find(item => item.id === Number(value as string));
            displayValue = item?.name ? [{ name: item.name, fullName: item?.fullName || '' }] : [{ name: (value as string), fullName: (value as string) }];
          }
        }

        return {
          key,
          label: this.getFilterLabel(key),
          displayValue
        };
      });
  }

  handleFilterChange(origin: AvailableFilters | string, newValue: Array<number> | string) {
    const selectedValue = newValue.length === 0 ? '' : newValue.toString();
    
    switch (origin) {
      case AvailableFilters.AREAS_TEMATICAS:
        // Faz uma requisição para pegar uma lista de Programas, Projetos e Entregas baseado nas Áreas Temáticas selecionadas
        this.strategicProjectsService.getProgramsProjectsDeliveries(selectedValue)
          .subscribe(
            (data: IStrategicProjectFilterDataDto) => {
              this.programaOList = [
                { id: -1, name: '(Sem Programa)' },
                ...data.programasOriginal
              ];
              this.entregaList = data.entregas;
              this.projetoList = data.projetos;
            },
            (error) => {
              console.error('Erro ao tentar carregar Programas, Projetos e Entregas: ', error);
            },
          );
        break;
      case AvailableFilters.PROGRAMAS_ORIGINAIS:
        // Faz uma requisição para pegar uma lista de Projetos e Entregas baseado nas Áreas Temáticas e Programas Originais selecionados
        const selectedAreasTematicas = this.filter.areaTematica?.length === 0 ? '' : this.filter.areaTematica?.toString();

        this.strategicProjectsService.getProjectsDeliveries(selectedAreasTematicas, selectedValue)
          .subscribe(
            (data: IStrategicProjectFilterDataDto) => {
              this.projetoList = data.projetos;
              this.entregaList = data.entregas;
            },
            (error) => {
              console.error('Erro ao tentar carregar Projetos e Entregas: ', error);
            },
          );
        break;
      case AvailableFilters.PROJETOS:
        // Faz uma requisição para pegar uma lista de Entregas baseado nas Áreas Temáticas, Programas Originais e Projetos selecionados
        const selectedAreas = this.filter.areaTematica?.length === 0 ? '' : this.filter.areaTematica?.toString();
        const selectedProgramas = this.filter.programaOrigem?.length === 0 ? '' : this.filter.programaOrigem?.toString();

        this.strategicProjectsService.getDeliveries(selectedAreas, selectedProgramas, selectedValue)
          .subscribe(
            (data: IStrategicProjectFilterDataDto) => {
              this.entregaList = data.entregas;
            },
            (error) => {
              console.error('Erro ao tentar carregar Entregas: ', error);
            }
          );
        break;
      case 'DataInicioMes':
        this.filter.dataInicio = `${this.filter.dataInicio.toString().slice(0, 4)}-${newValue}`;
        break;
      case 'DataInicioAno':
        this.filter.dataInicio = `${newValue}-${this.filter.dataInicio.toString().slice(5, 7)}`;
        break;
      case 'DataFinalMes':
        this.filter.dataFim = `${this.filter.dataFim.slice(0, 4)}-${newValue}`;
        break;
      case 'DataFinalAno':
        this.filter.dataFim = `${newValue}-${this.filter.dataFim.slice(5, 7)}`;
        break;
      default:
        break;
    }
  }

  getFilterLabel(key: string): string {
    const labels: { [key: string]: string } = {
      portfolio: 'Portfólio',
      dataInicio: 'De',
      dataFim: 'Até',
      previsaoConclusao: 'Previsão de Conclusão',
      areaTematica: 'Área Temática',
      programaOrigem: 'Programa Original',
      programaTransversal: 'Programa Transversal',
      entregas: 'Entregas',
      localidades: 'Localidades',
      orgaos: 'Órgãos',
      projetos: 'Projetos',
      acompanhamentos: 'Acompanhamentos'
    };

    return labels[key] || key;
  }

  removeFilter(key: AvailableFilters) {
    this.filter[key] = [];
    this.finalFilter = { ...this.filter };
    this.updateActiveFilters();
    this.loadTotals();
    this.handleFilterChange(key, []);
  }

  filtrar(event?: Event): void {
    if (event) event.preventDefault();
    this.closeFilterModal();
    this.finalFilter = { ...this.filter };
    this.updateActiveFilters();
    this.loadTotals()
  }

  loadAll(): void {
    this.strategicProjectsService.getAll().subscribe(
      (allFilterList: IStrategicProjectFilterDataDto) => {
        this.areaList = allFilterList.area;
        this.programaOList = [
          { id: -1, name: '(Sem Programa)', fullName: '(Sem Programa)' },
          ...allFilterList.programasOriginal
        ];
        this.programaTList = allFilterList.programasTransversal;
        this.entregaList = allFilterList.entregas;
        this.orgaoList = allFilterList.orgaos.sort((a, b) => a.name.localeCompare(b.name));
        
        // Monta a lista de localidades, ordenando por ordem alfabética todas as microregiões, e os municípios que pertencem àquela microregião

        const localidadesList = [allFilterList.localidades.find((el) => el.tipo === 'ESTADO')];
        
        const microregioes = allFilterList.localidades
          .filter((localidade) => localidade?.tipo === 'MICRORREGIÃO')
          .sort((a, b) => a.name.localeCompare(b.name));

        microregioes.forEach((regiao) => {
          localidadesList.push(regiao);

          allFilterList.localidades
          .filter((localidade) => localidade?.microregiaoId === regiao.microregiaoId && localidade?.name !== regiao.name)
          .sort((a, b) => a.name.localeCompare(b.name))
          .forEach((localidade) => localidadesList.push(localidade));
        });

        this.localidadeList = localidadesList;
        this.projetoList = allFilterList.projetos;
      },
      (error) => {
        console.error('Erro ao carregar áreas temáticas:', error);
      }
    );
  }

  resetFilters(): void {
    this.closeFilterModal();

    this.finalFilter = {
      portfolio: environment.strategicProjectFilter.portfolio,
      dataInicio: environment.strategicProjectFilter.dataInicio,
      dataFim: environment.strategicProjectFilter.dataFim,
      previsaoConclusao: '',
      areaTematica: [],
      programaOrigem: [],
      projetos: [],
      entregas: [],
      programaTransversal: [],
      localidades: [],
      orgaos: [],
      acompanhamentos: [],
    };
    this.filter = { ...this.finalFilter };
    this.updateActiveFilters();
    this.loadTotals();
  }

  loadTimestamp() {
    this.strategicProjectsService.getTimestamp().subscribe(
      (data: IStrategicProjectTimestamp) => {
        this.timestamp = data.timestamp;
      },
      (error) => {
        console.error('Erro ao carregar os totais:', error);
      }
    );
  }

  loadTotals() {
    this.requestStatus.totals = RequestStatus.LOADING;
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.finalFilter);

    this.strategicProjectsService.getTotals(cleanedFilter).subscribe(
      (totals: IStrategicProjectTotals) => {
        this.totals = totals;
        this.requestStatus.totals = RequestStatus.SUCCESS;
      },
      (error) => {
        console.error('Erro ao carregar os totais:', error);
        this.requestStatus.totals = RequestStatus.ERROR;
      }
    );
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

  openAndCloseMap() {
    this.isMapOpen = !this.isMapOpen;
  }

  onMapFilterChange(newFilter: any): void {
    this.filter = { ...this.filter, ...newFilter };
    this.finalFilter = { ...this.filter };

    this.updateActiveFilters();

    this.loadTotals();
  }

  handleNewTableFilter(newFilter: IStrategicProjectFilterValuesDto, source: 'InvestmentBy' | 'DeliveriesBy') {
    let newLocalFilter: any = {
      portfolio: environment.strategicProjectFilter.portfolio,
      dataInicio: new Date(environment.strategicProjectFilter.dataInicio),
      dataFim: new Date(environment.strategicProjectFilter.dataFim),
    };

    let newEntityToBeDisplayed;

    if (newFilter.areaId) {
      newLocalFilter = { ...newLocalFilter, areaTematica: [Number(newFilter.areaId)] }; 
      newEntityToBeDisplayed = 'Programa';
    }
    if (newFilter.programaOriginalId) {
      newLocalFilter = { ...newLocalFilter, programaOrigem: [newFilter.programaOriginalId] };
      newEntityToBeDisplayed = 'Projeto';
    }
    if (newFilter.programaTransversalId) {
      newLocalFilter = { ...newLocalFilter, programaTransversal: [newFilter.programaTransversalId] };
      newEntityToBeDisplayed = 'Projeto';
    }
    if (newFilter.projetoId) {
      newLocalFilter = { ...newLocalFilter, projetos: [newFilter.projetoId] };
      newEntityToBeDisplayed = 'Entrega';
    }
    if (newFilter.entregaId) {
      newLocalFilter = { ...newLocalFilter, entregas: [newFilter.entregaId] };
      newEntityToBeDisplayed = 'Entrega';
    }

    this.filter = newLocalFilter;
    this.filtrar();

    this.tableFilteringTrigger.next({
      source,
      newSelectedEntity: newEntityToBeDisplayed,
    });
  }

  closeFilterModal() {
    (document.activeElement as HTMLElement)?.blur();
    /*
     * Isso serve pra evitar um erro de "Blocked aria-hidden on an element because its descendent retained focus..."
     * que ocorre quando se fecha um elemento/componente (tipo um offcanvas ou nesse caso um modal) com aria-hidden="true" (utilizado por leitores de telas)
     * enquanto um elemento dentro desse componente ainda está com foco.
     * Por isso se faz necessário remover o foco desse elemento antes de fechar o componente.
     */

    if (this.isFilterModalOpen) this.modalCloseButtonRef.nativeElement.click();
  }
}
