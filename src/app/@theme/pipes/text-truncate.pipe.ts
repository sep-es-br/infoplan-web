import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'TextTruncate', standalone: true })
export class TextTruncatePipe implements PipeTransform {
  transform(element: string, numOfChars: number): string {
    if (element.length > numOfChars) {
      return `${element.slice(0, numOfChars - 1)}...`;
    }

    return element;
  }
}