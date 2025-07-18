import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'TextTruncate', standalone: true })
export class TextTruncatePipe implements PipeTransform {
  transform(element: string, numOfChars: number, customLastChar?: string): string {
    let finalString = element;

    if (element.length > numOfChars) {
      finalString = `${element.slice(0, numOfChars - 1)}...`;
    }

    if (customLastChar) {
      finalString = `${finalString}${customLastChar}`;
    }

    return finalString;
  }
}