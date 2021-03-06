import { EventEmitter, TemplateRef } from '@angular/core';
import { ColorHelper } from '../common/color.helper';
export declare class GaugeArcComponent {
    backgroundArc: any;
    valueArc: any;
    cornerRadius: any;
    colors: ColorHelper;
    isActive: boolean;
    tooltipDisabled: boolean;
    valueFormatting: (value: any) => string;
    tooltipTemplate: TemplateRef<any>;
    select: EventEmitter<{}>;
    activate: EventEmitter<{}>;
    deactivate: EventEmitter<{}>;
    coords: any;
    transform: any;
    xval: any;
    yval: any;
    ngOnInit(): void;
    tooltipText(arc: any): string;
}
