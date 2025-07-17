import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StrategicProjectsService } from '../../core/service/strategic-projects.service';
import { IIdAndName } from '../../core/interfaces/id-and-name.interface';
import { IStrategicProjectFilterDataDto } from '../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectTotals } from '../../core/interfaces/strategic-project-totals.interface';
import { IStrategicProjectTimestamp } from '../../core/interfaces/strategic-project.interface';
import { NbThemeService } from '@nebular/theme';
import { AvailableThemes } from '../../@theme/theme.module';

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

@Component({
  selector: 'ngx-strategic-projects',
  templateUrl: './strategicProjects.component.html',
  styleUrls: ['./strategicProjects.component.scss']
})
export class StrategicProjectsComponent {
  timestamp: string;

  isMapOpen = false;

  showFilters = false;

  totals: IStrategicProjectTotals = {
    qdeProgramas: 0,
    qdeProjetos: 0,
    totalEntregasPE: 0,
    totalPrevisto: 0,
    totalRealizado: 0,
  };

  filter = {
    portfolio: environment.strategicProjectFilter.portfolio,
    dataInicio: new Date(environment.strategicProjectFilter.dataInicio),
    dataFim: new Date(environment.strategicProjectFilter.dataFim),
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

  finalFilter = {
    portfolio: environment.strategicProjectFilter.portfolio,
    dataInicio: new Date(environment.strategicProjectFilter.dataInicio),
    dataFim: new Date(environment.strategicProjectFilter.dataFim),
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

  areaList: IIdAndName[] = [];
  programaOList: IIdAndName[] = [];
  programaTList: IIdAndName[] = [];
  entregaList: IIdAndName[] = [];
  orgaoList: IIdAndName[] = [];
  localidadeList: IIdAndName[] = [];
  projetoList: IIdAndName[] = [];

  activeFilters: { key: string; label: string; value: string }[] = [];

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
        let displayValue: string;

        if (directValueKeys.includes(key)) {
          if (key === 'dataInicio' || key === 'dataFim') {
            const year = ((value as Date).getFullYear()).toString();
            let month = ((value as Date).getMonth() + 1).toString();
            if (Number(month) < 10) month = `0${month}`;
            displayValue = `${month}-${year}`;
          } else {
            displayValue = (value as string);
          }
        } else {
          const listKey = optionsMapping[key];
          const list = this[listKey as keyof this] as IIdAndName[];

          if (Array.isArray(value)) {
            displayValue = value.map((selectedItem, index) => {
              let name = list?.find((item) => item.id === selectedItem)?.name || selectedItem;
              if (index + 1 < value.length) {
                name = `${name}; `;
              }
              return name;
            }).join('');
          } else {
            displayValue = list?.find(item => item.id === Number(value as string))?.name || (value as string);
          }
        }

        return {
          key,
          label: this.getFilterLabel(key),
          value: displayValue
        };
      });
  }

  handleFilterChange(origin: AvailableFilters, newValue: Array<number>) {
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
        const selectedAreasTematicas = this.filter.areaTematica?.length === 0 ? '' : this.filter.areaTematica.toString();

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
        const selectedAreas = this.filter.areaTematica?.length === 0 ? '' : this.filter.areaTematica.toString();
        const selectedProgramas = this.filter.programaOrigem?.length === 0 ? '' : this.filter.programaOrigem.toString();

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

  toggleFiltroPanel() {
    this.showFilters = !this.showFilters;
  }

  filtrar(event: Event): void {
    event.preventDefault();
    this.showFilters = !this.showFilters;
    this.finalFilter = { ...this.filter };
    this.updateActiveFilters();
    this.loadTotals()
  }

  loadAll(): void {
    this.strategicProjectsService.getAll().subscribe(
      (allFilterList: IStrategicProjectFilterDataDto) => {
        this.areaList = allFilterList.area
        this.programaOList = [
          { id: -1, name: '(Sem Programa)' },
          ...allFilterList.programasOriginal
        ];
        this.programaTList = allFilterList.programasTransversal
        this.entregaList = allFilterList.entregas
        this.orgaoList = allFilterList.orgaos
        this.localidadeList = allFilterList.localidades
        this.projetoList = allFilterList.projetos
      },
      (error) => {
        console.error('Erro ao carregar áreas temáticas:', error);
      }
    );
  }

  resetFilters(): void {
    this.showFilters = !this.showFilters;
    this.finalFilter = {
      portfolio: environment.strategicProjectFilter.portfolio,
      dataInicio: new Date(environment.strategicProjectFilter.dataInicio),
      dataFim: new Date(environment.strategicProjectFilter.dataFim),
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
    const cleanedFilter = this.strategicProjectsService.removeEmptyValues(this.finalFilter);

    this.strategicProjectsService.getTotals(cleanedFilter).subscribe(
      (totals: IStrategicProjectTotals) => {
        this.totals = totals;
      },
      (error) => {
        console.error('Erro ao carregar os totais:', error);
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
}
