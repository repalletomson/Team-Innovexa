import React from "react";
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject,
  CandleSeries,
  Category,
  Tooltip,
  Zoom,
  Crosshair,
  DateTime
} from "@syncfusion/ej2-react-charts";

const CandleStickChart = () => {
  // Sample stock OHLC data
  const stockData = [
    { x: new Date(2024, 0, 1), open: 110, high: 120, low: 105, close: 118 },
    { x: new Date(2024, 0, 2), open: 118, high: 125, low: 115, close: 122 },
    { x: new Date(2024, 0, 3), open: 122, high: 130, low: 121, close: 128 },
    { x: new Date(2024, 0, 4), open: 128, high: 133, low: 124, close: 129 },
    { x: new Date(2024, 0, 5), open: 129, high: 135, low: 126, close: 133 },
    { x: new Date(2024, 0, 6), open: 133, high: 138, low: 130, close: 132 },
    { x: new Date(2024, 0, 7), open: 132, high: 140, low: 131, close: 138 },
    { x: new Date(2024, 0, 8), open: 110, high: 120, low: 105, close: 118 },
    { x: new Date(2024, 0, 9), open: 118, high: 125, low: 115, close: 122 },
    { x: new Date(2024, 0, 10), open: 122, high: 130, low: 121, close: 128 },
    { x: new Date(2024, 0, 11), open: 128, high: 133, low: 124, close: 129 },
    { x: new Date(2024, 0, 12), open: 129, high: 135, low: 126, close: 133 },
    { x: new Date(2024, 0, 13), open: 133, high: 138, low: 130, close: 132 },
  ];

  return (
    <ChartComponent
      id="candlestick-chart"
      primaryXAxis={{
        valueType: "DateTime",
        labelFormat: "MMM dd",
        majorGridLines: { width: 0 }
      }}
      primaryYAxis={{
        title: "Price (USD)",
        labelFormat: "${value}",
        majorGridLines: { width: 1 }
      }}
      title="Stock Price Analysis"
      tooltip={{ enable: true }}
      zoomSettings={{ enableSelectionZooming: true }}
      crosshair={{ enable: true }}
      height="400px"
    >
      <Inject services={[CandleSeries, Category, Tooltip, Zoom, Crosshair, DateTime]} />

      <SeriesCollectionDirective>
        <SeriesDirective
          dataSource={stockData}
          xName="x"
          high="high"
          low="low"
          open="open"
          close="close"
          type="Candle"
          bearFillColor="#d32f2f"   // Red color for bearish
          bullFillColor="#4caf50"   // Green for bullish
        />
      </SeriesCollectionDirective>
    </ChartComponent>
  );
};

export default CandleStickChart;
