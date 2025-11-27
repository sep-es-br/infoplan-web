import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChartMaximizeState {
  maximizedChartId: string | null;
  isAnyChartMaximized: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChartMaximizeService {
  // ⬅️ ESTADO CENTRALIZADO
  private maximizeState = new BehaviorSubject<ChartMaximizeState>({
    maximizedChartId: null,
    isAnyChartMaximized: false
  });

  // ⬅️ OBSERVABLE PARA OS COMPONENTES ESCUTAREM
  maximizeState$: Observable<ChartMaximizeState> = this.maximizeState.asObservable();

  // ⬅️ MÉTODO PARA MAXIMIZAR/MINIMIZAR
  toggleChartMaximize(chartId: string, shouldMaximize: boolean): void {
    const currentState = this.maximizeState.value;

    let newState: ChartMaximizeState;

    if (shouldMaximize) {
      newState = {
        maximizedChartId: chartId,
        isAnyChartMaximized: true
      };
      console.log(`📊 Service - Maximizando gráfico: ${chartId}`);
    } else {
      newState = {
        maximizedChartId: null,
        isAnyChartMaximized: false
      };
      console.log(`📊 Service - Minimizando gráfico: ${chartId}`);
    }

    this.maximizeState.next(newState);
  }

  // ⬅️ MÉTODOS ÚTEIS
  isChartMaximized(chartId: string): boolean {
    return this.maximizeState.value.maximizedChartId === chartId;
  }

  isAnyChartMaximized(): boolean {
    return this.maximizeState.value.isAnyChartMaximized;
  }

  getCurrentMaximizedChart(): string | null {
    return this.maximizeState.value.maximizedChartId;
  }

  // ⬅️ FORÇAR MINIMIZAR TODOS (emergência)
  minimizeAllCharts(): void {
    this.maximizeState.next({
      maximizedChartId: null,
      isAnyChartMaximized: false
    });
  }
}