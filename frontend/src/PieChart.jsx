import React from "react";
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  PieSeries,
  AccumulationLegend,
  AccumulationTooltip
} from "@syncfusion/ej2-react-charts";

const PieChart = () => {
  // Sample data
  const pieData = [
    { x: "Chrome", y: 37 },
    { x: "Safari", y: 25 },
    { x: "Firefox", y: 18 },
    { x: "Edge", y: 12 },
    { x: "Others", y: 8 }
  ];

  return (
    <AccumulationChartComponent
      id="pie-chart"
      legendSettings={{ visible: true }}
      tooltip={{ enable: true }}
      height="350px"
    >
      <Inject services={[PieSeries, AccumulationLegend, AccumulationTooltip]} />

      <AccumulationSeriesCollectionDirective>
        <AccumulationSeriesDirective
          dataSource={pieData}
          xName="x"
          yName="y"
          type="Pie"
          dataLabel={{
            visible: true,
            position: "Outside",
            name: "text"
          }}
          radius="70%"
        />
      </AccumulationSeriesCollectionDirective>
    </AccumulationChartComponent>
  );
};

export default PieChart;
