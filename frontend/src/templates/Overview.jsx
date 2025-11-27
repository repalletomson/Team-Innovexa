import React from "react";
import {
  DashboardLayoutComponent,
  PanelsDirective,
  PanelDirective,
} from "@syncfusion/ej2-react-layouts";

import { Browser } from "@syncfusion/ej2-base";

import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  AccumulationLegend,
  PieSeries,
  AccumulationTooltip,
  ColumnSeries,
  SeriesCollectionDirective,
  SeriesDirective,
  AccumulationDataLabel,
  ChartComponent,
  Legend,
  Category,
  Tooltip,
  Highlight,
  DataLabel,
  SplineAreaSeries,
  ChartAnnotation,
} from "@syncfusion/ej2-react-charts";

import {
  accPointRender,
  loadAccumulationChartTheme,
  loadChartTheme,
} from "./theme-color";

const SAMPLE_CSS = `
.e-dashboardlayout {
  padding: 20px;
  z-index: 0;
}
.e-panel {
  cursor: auto !important;
}
.e-panel-header{
  border: none !important;
  background-color: backgroundcolor;
  height: 50px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}
.template{
  height: 100%;
  width: 100%;
}

#control-container {
    padding: 0px !important;
}

.title{
  font-size: 15px;
  font-weight: bold;
  color: #737373;
}
`;

function OverView() {
  const cellSpacing = [15, 15];

  /** COLUMN CHART TEMPLATE */
  const columnTemplate = () => (
    <div className="template">
      <ChartComponent
        style={{ height: "100%", width: "100%" }}
        primaryXAxis={{
          valueType: "Category",
          majorGridLines: { width: 0 },
          labelStyle: { size: "11px" },
        }}
        load={load}
        primaryYAxis={{
          minimum: 0,
          maximum: 100,
          majorTickLines: { width: 0 },
          labelFormat: "{value}%",
          lineStyle: { width: 0 },
          labelStyle: { size: "11px" },
        }}
        tooltip={{ enable: false }}
        legendSettings={{ padding: 5, shapeHeight: 8, shapeWidth: 8 }}
        chartArea={{ border: { width: 0 }, margin: { bottom: 12 } }}
      >
        <Inject services={[ColumnSeries, Legend, Tooltip, Category, DataLabel, Highlight]} />
        <SeriesCollectionDirective>
          <SeriesDirective
            type="Column"
            dataSource={[
              { Period: "2020", Percentage: 100 },
              { Period: "2021", Percentage: 56 },
              { Period: "2022", Percentage: 71 },
              { Period: "2023", Percentage: 85 },
              { Period: "2024", Percentage: 73 },
            ]}
            xName="Period"
            yName="Percentage"
            name="Online"
            fill="#2485FA"
            marker={{ dataLabel: { visible: true, position: "Middle", font: { color: "white" } } }}
            cornerRadius={{ topLeft: 4, topRight: 4 }}
          />
          <SeriesDirective
            type="Column"
            dataSource={[
              { Period: "2020", Percentage: 40 },
              { Period: "2021", Percentage: 44 },
              { Period: "2022", Percentage: 29 },
              { Period: "2023", Percentage: 15 },
              { Period: "2024", Percentage: 27 },
            ]}
            xName="Period"
            yName="Percentage"
            name="Retail"
            fill="#FEC200"
            marker={{ dataLabel: { visible: true, position: "Middle", font: { color: "white" } } }}
            cornerRadius={{ topLeft: 4, topRight: 4 }}
          />
        </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );

  /** PIE CHART TEMPLATE */
  const pieTemplate = () => (
    <div className="template">
      <AccumulationChartComponent
        style={{ height: "100%", width: "100%" }}
        legendSettings={{ visible: false }}
        load={accumulationload}
        tooltip={{ enable: true, enableHighlight: true }}
        pointRender={onPointRender}
      >
        <Inject
          services={[
            PieSeries,
            AccumulationTooltip,
            AccumulationDataLabel,
            AccumulationLegend,
          ]}
        />
        <AccumulationSeriesCollectionDirective>
          <AccumulationSeriesDirective
            dataSource={[
              { Product: "TV : 30 (12%)", Percentage: 12, r: "TV, 30 <br>12%" },
              { Product: "PC : 20 (8%)", Percentage: 8, r: "PC, 20 <br>8%" },
              { Product: "Laptop : 40 (16%)", Percentage: 16, r: "Laptop, 40 <br>16%" },
              { Product: "Mobile : 90 (36%)", Percentage: 36, r: "Mobile, 90 <br>36%" },
              { Product: "Camera : 27 (11%)", Percentage: 11, r: "Camera, 27 <br>11%" },
            ]}
            xName="Product"
            yName="Percentage"
            dataLabel={{
              visible: true,
              position: "Outside",
              name: "r",
              connectorStyle: { length: "10px", type: "Curve" },
            }}
            type="Pie"
            innerRadius="40%"
          />
        </AccumulationSeriesCollectionDirective>
      </AccumulationChartComponent>
    </div>
  );

  /** SPLINE CHART TEMPLATE */
  const splineTemplate = () => (
    <div className="template">
      <ChartComponent
        style={{ height: "100%", width: "100%" }}
        primaryXAxis={{
          valueType: "Category",
          majorGridLines: { width: 0 },
          labelStyle: { size: "11px" },
        }}
        load={load}
        primaryYAxis={{
          minimum: 0,
          maximum: 12000,
          majorTickLines: { width: 0 },
          labelFormat: "${value}",
          labelStyle: { size: "11px" },
        }}
        tooltip={{ enable: true }}
        chartArea={{ border: { width: 0 }, margin: { bottom: 12 } }}
      >
        <Inject services={[SplineAreaSeries, Legend, Tooltip, Category, ChartAnnotation, Highlight]} />

        <SeriesCollectionDirective>
          <SeriesDirective
            type="SplineArea"
            dataSource={[
              { period: "Jan", percentage: 3600 },
              { period: "Feb", percentage: 6200 },
              { period: "Mar", percentage: 8100 },
              { period: "Apr", percentage: 5900 },
              { period: "May", percentage: 8900 },
              { period: "Jun", percentage: 7200 },
              { period: "Jul", percentage: 4300 },
              { period: "Aug", percentage: 4600 },
              { period: "Sep", percentage: 5500 },
              { period: "Oct", percentage: 6350 },
              { period: "Nov", percentage: 5700 },
              { period: "Dec", percentage: 8000 },
            ]}
            xName="period"
            yName="percentage"
            name="Online"
            fill="#2485FA"
            opacity={0.3}
          />
          <SeriesDirective
            type="SplineArea"
            dataSource={[
              { period: "Jan", percentage: 6400 },
              { period: "Feb", percentage: 5300 },
              { period: "Mar", percentage: 4900 },
              { period: "Apr", percentage: 5300 },
              { period: "May", percentage: 4200 },
              { period: "Jun", percentage: 6500 },
              { period: "Jul", percentage: 7900 },
              { period: "Aug", percentage: 3800 },
              { period: "Sep", percentage: 6800 },
              { period: "Oct", percentage: 3400 },
              { period: "Nov", percentage: 6400 },
              { period: "Dec", percentage: 6800 },
            ]}
            xName="period"
            yName="percentage"
            name="Retail"
            fill="#FEC200"
            opacity={0.3}
          />
          </SeriesCollectionDirective>
      </ChartComponent>
    </div>
  );

  /** THEMES */
  function load(args) {
    loadChartTheme(args);
  }

  function accumulationload(args) {
    loadAccumulationChartTheme(args);
  }

  function onPointRender(args) {
    accPointRender(args);
  }

  return (
    <div>
      <style>{SAMPLE_CSS}</style>

      <DashboardLayoutComponent
        cellSpacing={cellSpacing}
        cellAspectRatio={Browser.isDevice ? 1 : 0.8}
        columns={Browser.isDevice ? 2 : 8}
      >
        <PanelsDirective>
          <PanelDirective
            sizeX={Browser.isDevice ? 1 : 5}
            sizeY={Browser.isDevice ? 1 : 2}
            row={0}
            col={0}
            content={columnTemplate}
            header='<div class="title">Sales - Yearly Performance</div>'
          />

          <PanelDirective
            sizeX={Browser.isDevice ? 1 : 3}
            sizeY={Browser.isDevice ? 1 : 2}
            row={0}
            col={Browser.isDevice ? 1 : 5}
            content={pieTemplate}
            header='<div class="title">Product Wise Sales - 2024</div>'
          />

          <PanelDirective
            sizeX={Browser.isDevice ? 2 : 8}
            sizeY={Browser.isDevice ? 1 : 3}
            row={Browser.isDevice ? 1 : 4}
            col={0}
            content={splineTemplate}
            header='<div class="title">Monthly Sales for 2024</div>'
          />
        </PanelsDirective>
      </DashboardLayoutComponent>
    </div>
  );
}

export default OverView;
