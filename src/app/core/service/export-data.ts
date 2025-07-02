import { Injectable } from "@angular/core";
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root',
})
export class ExportDataService {
  public exportXLSXWithCustomHeaders(
    data: Array<any>,
    columns: Array<{ key: string; label: string; }>,
    fileName: string,
  ) {
    
  }
  
  public exportCSVWithCustomHeaders(
    data: Array<any>,
    columns: Array<{ key: string; label: string; }>,
    fileName: string
  ) {
    const header = columns.map((col) => col.label).join(',');
    const rows = data.map((item) => columns.map((col) => `"${item[col.key] ?? ''}"`).join(','));
    const csvContent = [header, ...rows].join('\r\n');
    this.downloadFile(csvContent, fileName);
  }

  private downloadFile(content: any, fileName: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}