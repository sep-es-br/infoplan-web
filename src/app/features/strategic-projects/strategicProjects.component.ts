import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StrategicProjectsService } from '../../core/service/strategic-projects.service';
import { IIdAndName } from '../../core/interfaces/id-and-name.interface';
import { IStrategicProjectFilterDataDto } from '../../core/interfaces/strategic-project-filter.interface';
import { IStrategicProjectTotals } from '../../core/interfaces/strategic-project-totals.interface';

@Component({
  selector: 'ngx-strategic-projects',
  templateUrl: './strategicProjects.component.html',
  styleUrls: ['./strategicProjects.component.scss']
})
export class StrategicProjectsComponent {

  investmentSelectedOption: string = 'Área Temática';

  deliveriesSelectedOption: string = 'Área Temática';

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
    dataInicio: environment.strategicProjectFilter.dataInicio,
    dataFim: environment.strategicProjectFilter.dataFim,
    previsaoConclusao: '',
    areaTematica: '',
    programaOrigem: '',
    projetos: '',
    entregas: '',
    programaTransversal: '',
    localidades: '',
    orgaos: '',
    acompanhamentos: '',
  };

  finalFilter = {
    portfolio: environment.strategicProjectFilter.portfolio,
    dataInicio: environment.strategicProjectFilter.dataInicio,
    dataFim: environment.strategicProjectFilter.dataFim,
    previsaoConclusao: '',
    areaTematica: '',
    programaOrigem: '',
    projetos: '',
    entregas: '',
    programaTransversal: '',
    localidades: '',
    orgaos: '',
    acompanhamentos: '',
  };

  areaList: IIdAndName[] = [];
  programaOList: IIdAndName[] = [];
  programaTList: IIdAndName[] = [];
  entregaList: IIdAndName[] = [];
  orgaoList: IIdAndName[] = [];
  localidadeList: IIdAndName[] = [];
  projetoList: IIdAndName[] = [];

  activeFilters: { key: string; label: string; value: string }[] = [];

  constructor(private  strategicProjectsService :StrategicProjectsService) {
    this.updateActiveFilters()
    this.loadAll()
    this.loadTotals()
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
    .filter(([key, value]) => value) 
    .map(([key, value]) => {
      let displayValue: string;

      if (directValueKeys.includes(key)) {
        if (key === 'dataInicio' || key === 'dataFim') {
          const [year, month] = value.split('-');
          displayValue = `${month}-${year}`;
        } else {
          displayValue = value;
        }
      } else {
        const listKey = optionsMapping[key];
        const list = this[listKey as keyof this] as IIdAndName[];
        displayValue = list?.find(item => item.id === Number(value))?.name || value; 
      }

      return {
        key,
        label: this.getFilterLabel(key),
        value: displayValue
      };
    });
  }

  selectedOptionI(event: any) {
    this.investmentSelectedOption = event.target.value;
  }

  selectedOptionD(event: any) {
    this.deliveriesSelectedOption = event.target.value;
  }

  onFilterChange(event: Event): void {
    let selectedValue = (event.target as HTMLSelectElement).value;
    const selecetedName = (event.target as HTMLSelectElement).name;
    
    if (selectedValue === "") {
      selectedValue = "todos";
    }

    if (selecetedName === 'areaTematica') {
      if(selectedValue != "todos"){
        this.filter.areaTematica = selectedValue
      }

      this.strategicProjectsService.getProgramsProjectsDeliveries(selectedValue).subscribe(
        (data: IStrategicProjectFilterDataDto) => {
          this.programaOList = data.programasOriginal
          this.entregaList = data.entregas
          this.projetoList = data.projetos

          if (!this.programaOList.some(programa => programa.id.toString() === this.filter.programaOrigem)) {
            this.filter.programaOrigem = ""; 
          }
  
          if (!this.projetoList.some(projeto => projeto.id.toString() === this.filter.projetos)) {
            this.filter.projetos = ""; 
          }
  
          if (!this.entregaList.some(entrega => entrega.id.toString() === this.filter.entregas)) {
            this.filter.entregas = ""; 
          }
        },
        (error) => {
          console.error('Erro ao carregar programas, entregas e projetos:', error);
        }
      );
    }else if (selecetedName === 'programaOrigem') {
      if(selectedValue != "todos"){
        this.filter.programaOrigem = selectedValue
      }

      const areaId = this.filter.areaTematica === '' ? 'todos' : this.filter.areaTematica;

      this.strategicProjectsService.getProjectsDeliveries(areaId, selectedValue).subscribe(
        (data: IStrategicProjectFilterDataDto) => {
          this.entregaList = data.entregas
          this.projetoList = data.projetos
          
          if (!this.projetoList.some(projeto => projeto.id.toString() === this.filter.projetos)) {
            this.filter.projetos = ""; 
          }
  
          if (!this.entregaList.some(entrega => entrega.id.toString() === this.filter.entregas)) {
            this.filter.entregas = ""; 
          }
        },
        (error) => {
          console.error('Erro ao carregar entregas e projetos:', error);
        }
      );
    } else if (selecetedName === 'projetos') {
      if(selectedValue != "todos"){
        this.filter.projetos = selectedValue
      }

      const areaId = this.filter.areaTematica === '' ? 'todos' : this.filter.areaTematica;

      const programId = this.filter.programaOrigem === '' ? 'todos' : this.filter.programaOrigem

      this.strategicProjectsService.getDeliveries(areaId, programId, selectedValue).subscribe(
        (data: IStrategicProjectFilterDataDto) => {
          this.entregaList = data.entregas

          if (!this.entregaList.some(entrega => entrega.id.toString() === this.filter.entregas)) {
            this.filter.entregas = ""; 
          }
        },
        (error) => {
          console.error('Erro ao carregar entregas e projetos:', error);
        }
      );
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

  removeFilter(key: string) {
    this.filter[key] = '';
    this.finalFilter = { ...this.filter };
    this.updateActiveFilters();
    this.loadTotals()

    if (key === 'areaTematica') {

      this.strategicProjectsService.getProgramsProjectsDeliveries('todos').subscribe(
        (data: IStrategicProjectFilterDataDto) => {
          this.programaOList = data.programasOriginal
          this.entregaList = data.entregas
          this.projetoList = data.projetos

          if (!this.programaOList.some(programa => programa.id.toString() === this.filter.programaOrigem)) {
            this.filter.programaOrigem = ""; 
          }
  
          if (!this.projetoList.some(projeto => projeto.id.toString() === this.filter.projetos)) {
            this.filter.projetos = ""; 
          }
  
          if (!this.entregaList.some(entrega => entrega.id.toString() === this.filter.entregas)) {
            this.filter.entregas = ""; 
          }
        },
        (error) => {
          console.error('Erro ao carregar programas, entregas e projetos:', error);
        }
      );
    } else if (key === 'programaOrigem') {

      const areaId = this.filter.areaTematica === '' ? 'todos' : this.filter.areaTematica;

      this.strategicProjectsService.getProjectsDeliveries(areaId, 'todos').subscribe(
        (data: IStrategicProjectFilterDataDto) => {
          this.entregaList = data.entregas
          this.projetoList = data.projetos
          
          if (!this.projetoList.some(projeto => projeto.id.toString() === this.filter.projetos)) {
            this.filter.projetos = ""; 
          }
  
          if (!this.entregaList.some(entrega => entrega.id.toString() === this.filter.entregas)) {
            this.filter.entregas = ""; 
          }
        },
        (error) => {
          console.error('Erro ao carregar entregas e projetos:', error);
        }
      );
    } else if (key === 'projetos') {

      const areaId = this.filter.areaTematica === '' ? 'todos' : this.filter.areaTematica;

      const programId = this.filter.programaOrigem === '' ? 'todos' : this.filter.programaOrigem

      this.strategicProjectsService.getDeliveries(areaId, programId, 'todos').subscribe(
        (data: IStrategicProjectFilterDataDto) => {
          this.entregaList = data.entregas

          if (!this.entregaList.some(entrega => entrega.id.toString() === this.filter.entregas)) {
            this.filter.entregas = ""; 
          }
        },
        (error) => {
          console.error('Erro ao carregar entregas e projetos:', error);
        }
      );
    }

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
        this.programaOList = allFilterList.programasOriginal
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
      return `${(value / 1_000_000_000).toFixed(2)} B`;
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)} M`;
    }

    return `R$ ${value.toLocaleString('pt-BR')}`;
  }
  

}
