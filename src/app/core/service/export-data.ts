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
    const formatedData = data.map((item) => {
      const row: any = {};
      columns.forEach((column) => {
        row[column.label] = item[column.key];
      });

      return row;
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formatedData);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'Infoplan': worksheet },
      SheetNames: ['Infoplan'],
    };

    if (!fileName.endsWith('.xlsx')) {
      fileName = `${fileName}.xlsx`;
    }

    XLSX.writeFile(workbook, fileName);
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