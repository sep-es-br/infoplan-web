import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ChartMaximizeState {
  maximizedChartId: string | null;
  isAnyChartMaximized: boolean;
  maximizedHeight: number;
}

@Injectable({
  providedIn: 'root'
})
export class ChartMaximizeService {
  private maximizeState = new BehaviorSubject<ChartMaximizeState>({
    maximizedChartId: null,
    isAnyChartMaximized: false,
    maximizedHeight: this.calcMaximizedHeight() // Altura inicial
  });

  maximizeState$: Observable<ChartMaximizeState> = this.maximizeState.asObservable();

  // ✅ MÉTODO PARA LIDAR COM CLIQUE DE MAXIMIZAR (agora no service)
  handleMaximizeButtonClick(chartId: string, event: boolean): void {
    const currentState = this.maximizeState.value;

    let newState: ChartMaximizeState;

    if (event) {
      newState = {
        maximizedChartId: chartId,
        isAnyChartMaximized: true,
        maximizedHeight: this.calcMaximizedHeight()
      };
    } else {
      newState = {
        maximizedChartId: null,
        isAnyChartMaximized: false,
        maximizedHeight: this.calcMaximizedHeight()
      };
    }

    this.maximizeState.next(newState);
  }

  // ✅ MÉTODO PARA CALCULAR ALTURA (agora no service)
  calcMaximizedHeight(): number {
    const windowHeight = window.innerHeight;
    const calculatedHeight = windowHeight - 250; // Ajuste este valor conforme necessário

    return Math.max(calculatedHeight, 250); // Altura mínima de 250px
  }

  // ✅ MÉTODO PARA ATUALIZAR ALTURA (útil para resize da janela)
  updateMaximizedHeight(): void {
    const currentState = this.maximizeState.value;
    const newHeight = this.calcMaximizedHeight();

    if (currentState.maximizedHeight !== newHeight) {
      this.maximizeState.next({
        ...currentState,
        maximizedHeight: newHeight
      });
    }
  }

  // ⬅️ MÉTODOS ÚTEIS (mantidos)
  isChartMaximized(chartId: string): boolean {
    return this.maximizeState.value.maximizedChartId === chartId;
  }

  isAnyChartMaximized(): boolean {
    return this.maximizeState.value.isAnyChartMaximized;
  }

  getCurrentMaximizedChart(): string | null {
    return this.maximizeState.value.maximizedChartId;
  }

  getCurrentHeight(): number {
    return this.maximizeState.value.maximizedHeight;
  }

  minimizeAllCharts(): void {
    this.maximizeState.next({
      maximizedChartId: null,
      isAnyChartMaximized: false,
      maximizedHeight: this.calcMaximizedHeight()
    });
  }
}