var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Component, Input, ViewChild, ChangeDetectionStrategy, Output, EventEmitter, ViewEncapsulation, ContentChild } from '@angular/core';
import { scaleLinear } from 'd3-scale';
import { BaseChartComponent } from '../common/base-chart.component';
import { calculateViewDimensions } from '../common/view-dimensions.helper';
import { ColorHelper } from '../common/color.helper';
var GaugeComponent = (function (_super) {
    __extends(GaugeComponent, _super);
    function GaugeComponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.legend = false;
        _this.legendTitle = '';
        _this.min = 0;
        _this.max = 100;
        _this.bigSegments = 10;
        _this.smallSegments = 5;
        _this.showAxis = true;
        _this.startAngle = -120;
        _this.angleSpan = 240;
        _this.activeEntries = [];
        _this.tooltipDisabled = false;
        _this.activate = new EventEmitter();
        _this.deactivate = new EventEmitter();
        _this.resizeScale = 1;
        _this.rotation = '';
        _this.textTransform = 'scale(1, 1)';
        _this.cornerRadius = 10;
        _this.redColor = 'red';
        return _this;
    }
    GaugeComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        _super.prototype.ngAfterViewInit.call(this);
        setTimeout(function () { return _this.scaleText(); });
    };
    GaugeComponent.prototype.update = function () {
        var _this = this;
        _super.prototype.update.call(this);
        if (!this.showAxis) {
            if (!this.margin) {
                this.margin = [10, 20, 10, 20];
            }
        }
        else {
            if (!this.margin) {
                this.margin = [60, 100, 60, 100];
            }
        }
        // make the starting angle positive
        if (this.startAngle < 0) {
            this.startAngle = (this.startAngle % 360) + 360;
        }
        this.angleSpan = Math.min(this.angleSpan, 360);
        this.dims = calculateViewDimensions({
            width: this.width,
            height: this.height,
            margins: this.margin,
            showLegend: this.legend
        });
        this.domain = this.getDomain();
        this.valueDomain = this.getValueDomain();
        this.valueScale = this.getValueScale();
        this.displayValue = this.getDisplayValue();
        this.outerRadius = Math.min(this.dims.width, this.dims.height) / 2.2;
        this.arcs = this.getArcs();
        this.setColors();
        this.legendOptions = this.getLegendOptions();
        var xOffset = (this.margin[2] + this.dims.width / 2) - 65;
        var yOffset = (this.margin[0] + this.dims.height / 2) - 50;
        this.transform = "translate(" + xOffset + ", " + yOffset + ")";
        this.rotation = "rotate(" + this.startAngle + ")";
        setTimeout(function () { return _this.scaleText(); }, 50);
    };
    GaugeComponent.prototype.getArcs = function () {
        var arcs = [];
        var availableRadius = this.outerRadius * .7;
        var radiusPerArc = Math.min(availableRadius / this.results.length, 10);
        var arcWidth = radiusPerArc * 1.5;
        this.textRadius = this.outerRadius - this.results.length * radiusPerArc;
        this.cornerRadius = Math.floor(arcWidth / 3);
        var i = 0;
        for (var _i = 0, _a = this.results; _i < _a.length; _i++) {
            var d = _a[_i];
            var outerRadius = this.outerRadius - (i * radiusPerArc * 2.5);
            var innerRadius = outerRadius - arcWidth;
            var backgroundArc = {
                endAngle: this.angleSpan * Math.PI / 180,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
                data: {
                    value: this.max,
                    name: d.name
                }
            };
            var valueArc = {
                endAngle: Math.min(this.valueScale(d.value), this.angleSpan) * Math.PI / 180,
                innerRadius: innerRadius,
                outerRadius: outerRadius,
                data: {
                    value: d.value,
                    name: d.name
                }
            };
            var arc = {
                backgroundArc: backgroundArc,
                valueArc: valueArc
            };
            arcs.push(arc);
            i++;
        }
        return arcs;
    };
    GaugeComponent.prototype.getDomain = function () {
        return this.results.map(function (d) { return d.name; });
    };
    GaugeComponent.prototype.getValueDomain = function () {
        var values = this.results.map(function (d) { return d.value; });
        var dataMin = Math.min.apply(Math, values);
        var dataMax = Math.max.apply(Math, values);
        if (this.min !== undefined) {
            this.min = Math.min(this.min, dataMin);
        }
        else {
            this.min = dataMin;
        }
        if (this.max !== undefined) {
            this.max = Math.max(this.max, dataMax);
        }
        else {
            this.max = dataMax;
        }
        return [this.min, this.max];
    };
    GaugeComponent.prototype.getValueScale = function () {
        return scaleLinear()
            .range([0, this.angleSpan])
            .nice()
            .domain(this.valueDomain);
    };
    GaugeComponent.prototype.getDisplayValue = function () {
        var finalarr = [];
        if (this.units) {
            // let arr = this.units.split(',');
            // arr.forEach((element, i) => {
            //   let obj = {};
            //   obj = { 'value': element.split(':')[0], 'dy': element.split(':')[1] }
            //   finalarr.push(obj);
            // });
            if (this.units) {
                var arr = this.units;
                arr.forEach(function (element, i) {
                    var obj = {};
                    // console.log("keys", element)
                    var data = element;
                    for (var keys in data) {
                        obj = { 'value': keys, 'dy': data[keys] };
                        finalarr.push(obj);
                    }
                });
            }
        }
        //   let arr = this.units.split(',');
        //   arr.forEach((element, i) => {
        //     let obj = {};
        //     var data = JSON.parse(element);
        //     for (var keys in data) {
        //       obj = { 'value': keys, 'dy': data[keys] }
        //       finalarr.push(obj);
        //     }
        //   });
        // }
        // console.log("Finalarr", finalarr);
        return finalarr;
    };
    GaugeComponent.prototype.scaleText = function (repeat) {
        var _this = this;
        if (repeat === void 0) { repeat = true; }
        var width = this.textEl.nativeElement.getBoundingClientRect().width;
        var oldScale = this.resizeScale;
        if (width === 0) {
            this.resizeScale = 1;
        }
        else {
            var availableSpace = this.textRadius;
            this.resizeScale = Math.floor((availableSpace / (width / this.resizeScale)) * 100) / 100;
        }
        if (this.resizeScale !== oldScale) {
            this.textTransform = "scale(" + this.resizeScale + ", " + this.resizeScale + ")";
            this.cd.markForCheck();
            if (repeat) {
                setTimeout(function () { return _this.scaleText(false); }, 50);
            }
        }
    };
    GaugeComponent.prototype.onClick = function (data) {
        this.select.emit(data);
    };
    GaugeComponent.prototype.getLegendOptions = function () {
        return {
            scaleType: 'ordinal',
            colors: this.colors,
            domain: this.domain,
            title: this.legendTitle
        };
    };
    GaugeComponent.prototype.setColors = function () {
        this.colors = new ColorHelper(this.scheme, 'ordinal', this.domain, this.customColors);
    };
    GaugeComponent.prototype.onActivate = function (item) {
        var idx = this.activeEntries.findIndex(function (d) {
            return d.name === item.name && d.value === item.value;
        });
        if (idx > -1) {
            return;
        }
        this.activeEntries = [item].concat(this.activeEntries);
        this.activate.emit({ value: item, entries: this.activeEntries });
    };
    GaugeComponent.prototype.onDeactivate = function (item) {
        var idx = this.activeEntries.findIndex(function (d) {
            return d.name === item.name && d.value === item.value;
        });
        this.activeEntries.splice(idx, 1);
        this.activeEntries = this.activeEntries.slice();
        this.deactivate.emit({ value: event, entries: this.activeEntries });
    };
    GaugeComponent.prototype.isActive = function (entry) {
        if (!this.activeEntries)
            return false;
        var item = this.activeEntries.find(function (d) {
            return entry.name === d.name && entry.series === d.series;
        });
        return item !== undefined;
    };
    return GaugeComponent;
}(BaseChartComponent));
export { GaugeComponent };
GaugeComponent.decorators = [
    { type: Component, args: [{
                selector: 'ngx-charts-gauge',
                template: "\n  <ngx-charts-chart\n  [view]=\"[width, height]\"\n  [showLegend]=\"legend\"\n  [legendOptions]=\"legendOptions\"\n  [activeEntries]=\"activeEntries\"\n  (legendLabelClick)=\"onClick($event)\"\n  (legendLabelActivate)=\"onActivate($event)\"\n  (legendLabelDeactivate)=\"onDeactivate($event)\">\n  <svg:g [attr.transform]=\"transform\" class=\"gauge chart\">\n  <svg:g *ngFor=\"let arc of arcs\" [attr.transform]=\"rotation\">\n  <svg:g ngx-charts-gauge-arc\n  [backgroundArc]=\"arc.backgroundArc\"\n  [valueArc]=\"arc.valueArc\"\n  [cornerRadius]=\"cornerRadius\"\n  [colors]=\"colors\"\n  [isActive]=\"isActive(arc.valueArc.data)\"\n  [tooltipDisabled]=\"tooltipDisabled\"\n  [tooltipTemplate]=\"tooltipTemplate\"\n  [valueFormatting]=\"valueFormatting\"\n  (select)=\"onClick($event)\"\n  (activate)=\"onActivate($event)\"\n  (deactivate)=\"onDeactivate($event)\">\n  </svg:g>\n  </svg:g>\n \n  <svg:g ngx-charts-gauge-axis\n  *ngIf=\"showAxis\"\n  [bigSegments]=\"bigSegments\"\n  [smallSegments]=\"smallSegments\"\n  [min]=\"min\"\n  [max]=\"max\"\n  [radius]=\"outerRadius\"\n  [angleSpan]=\"angleSpan\"\n  [valueScale]=\"valueScale\"\n  [startAngle]=\"startAngle\"\n  [tickFormatting]=\"axisTickFormatting\">\n  </svg:g>\n \n  <svg:text #textEl\n  [style.textAnchor]=\"'middle'\"\n  [attr.transform]=\"textTransform\"\n  alignment-baseline=\"central\">\n  <tspan *ngFor=\"let insideval of displayValue;let i = index\">\n  <tspan x=\"0\" [attr.y]=\"i +'em'\">\n  <tspan>{{insideval.value}}</tspan> &nbsp;\n  <tspan [style.fill]=\"insideval.dy?.includes('-') ? 'red' : insideval.dy?.includes('NA')? 'black' :'green'\"> {{insideval.dy}}</tspan> \n  </tspan>\n  </tspan>\n  </svg:text>\n \n  </svg:g>\n  </ngx-charts-chart>\n  ",
                styleUrls: [
                    '../common/base-chart.component.css',
                    './gauge.component.css'
                ],
                encapsulation: ViewEncapsulation.None,
                changeDetection: ChangeDetectionStrategy.OnPush,
            },] },
];
/** @nocollapse */
GaugeComponent.ctorParameters = function () { return []; };
GaugeComponent.propDecorators = {
    'legend': [{ type: Input },],
    'legendTitle': [{ type: Input },],
    'min': [{ type: Input },],
    'max': [{ type: Input },],
    'textValue': [{ type: Input },],
    'units': [{ type: Input },],
    'bigSegments': [{ type: Input },],
    'smallSegments': [{ type: Input },],
    'results': [{ type: Input },],
    'showAxis': [{ type: Input },],
    'startAngle': [{ type: Input },],
    'angleSpan': [{ type: Input },],
    'activeEntries': [{ type: Input },],
    'axisTickFormatting': [{ type: Input },],
    'tooltipDisabled': [{ type: Input },],
    'valueFormatting': [{ type: Input },],
    'margin': [{ type: Input },],
    'activate': [{ type: Output },],
    'deactivate': [{ type: Output },],
    'tooltipTemplate': [{ type: ContentChild, args: ['tooltipTemplate',] },],
    'textEl': [{ type: ViewChild, args: ['textEl',] },],
};
//# sourceMappingURL=gauge.component.js.map