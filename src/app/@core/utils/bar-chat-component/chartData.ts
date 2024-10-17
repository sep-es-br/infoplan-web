import { CustomCurrencyPipe, ShortNumberPipe } from "../../../@theme/pipes";

export class ChartData {
    dataId : number;
    value : number;
    label : string;

    valueLabel : string;
    valueTitle : string;

    constructor(dataId: number, label : string, value : number) {
        this.dataId = dataId;
        this.label = label;
        this.value = value;

        this.valueLabel = new ShortNumberPipe().transform(this.value);
        this.valueTitle = new CustomCurrencyPipe('BRL').transform(this.value);
    }
}