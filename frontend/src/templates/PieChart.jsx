import React from "react";
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  PieSeries,
  AccumulationTooltip,
  AccumulationDataLabel,
  AccumulationLegend
} from "@syncfusion/ej2-react-charts";

function PieChart({ data }) {
  return (
    <AccumulationChartComponent
      legendSettings={{ visible: true }}
      tooltip={{ enable: true }}
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
          dataSource={data}
          xName="label"
          yName="value"
          type="Pie"
          dataLabel={{
            visible: true,
            position: "Outside",
            connectorStyle: { length: "10px" },
          }}
          innerRadius="40%"
        />
      </AccumulationSeriesCollectionDirective>
    </AccumulationChartComponent>
  );
}

export default PieChart;

// DATA FETCHINGG AND SENDING......

// const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const res = await fetch("http://localhost:5000/sales");  // API from DB
//         const data = await res.json();

//         // Transform DB data → chart-friendly format
//         const formatted = data.map(item => ({
//           label: item.product_name,
//           value: item.sales_count,
//         }));

//         setChartData(formatted);

//       } catch (error) {
//         console.error("Error fetching DB data:", error);
//       }
//     }

//     fetchData();
//   }, []);