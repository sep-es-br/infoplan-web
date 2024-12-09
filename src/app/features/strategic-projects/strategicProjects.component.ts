import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-strategic-projects',
  templateUrl: './strategicProjects.component.html',
  styleUrls: ['./strategicProjects.component.scss']
})
export class StrategicProjectsComponent {

  showFilters = false;
  filtros = {
    portfolio: environment.strategicProjectFilter.portfolio,
    dataInicio: environment.strategicProjectFilter.dataInicio,
    dataFim: environment.strategicProjectFilter.dataFim,
    previsaoConclusao: '',
    areaTematica: '',
    programaOrigem: '',
    programaTransversal: '',
    entregas: '',
    localidades: '',
    orgaos: '',
    projetos: '',
    acompanhamentos: '',
  };

  dadosFiltrados: any[] = [];

  activeFilters: { key: string; label: string; value: string }[] = [];

  constructor() {
    this.updateActiveFilters()
  }


  updateActiveFilters() {
    this.activeFilters = Object.entries(this.filtros)
      .filter(([key, value]) => value) 
      .map(([key, value]) => ({
        key,
        label: this.getFilterLabel(key),
        value
      }));
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
    this.filtros[key] = '';
    this.updateActiveFilters();
  }

  toggleFiltroPanel() {
    this.showFilters = !this.showFilters;
  }

  filtrar(event: Event): void {
    event.preventDefault(); 
    this.showFilters = !this.showFilters;
    this.updateActiveFilters();
  }

}
