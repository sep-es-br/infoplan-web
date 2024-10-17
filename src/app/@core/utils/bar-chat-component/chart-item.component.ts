import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
    selector: 'ngx-chart-item',
    templateUrl: 'chart-item.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class ChartItemComponent {

    @Input() value : {
        id: number,
        label: string,
        value: number
    } = {
        id: -1,
        label: 'teste',
        value: 100
    };

    cores = ['blue', 'red', 'green'];

    @Input() maxValue : number = 100;

    coracao = function (cor : string) {
        alert('coração ' + cor + ' <3');
    }

}