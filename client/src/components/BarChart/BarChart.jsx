import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";

const CustomTick = ({ x, y, payload }) => {
    const words = payload.value.split(" "); // Split the name into words
  
    return (
      <text x={x} y={y} textAnchor="middle" fontSize={"calc(1vw + 5px)"} fill="#333">
        {words.map((word, index) => (
          <tspan key={index} x={x} dy={index === 0 ? 0 : 12}>
            {word}
          </tspan>
        ))}
      </text>
    );
  };


const VerticalBarChart = ({data}) => {
  return (
    <div style={{ width: "100%", height: "250px" ,backgroundColor:"white",display:"flex",justifyContent:"center",alignItems:"center",borderRadius:"10px",marginTop:"10px"}}>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 10, left: -30, bottom: 35 }}
        >
          <XAxis
            dataKey="name"
            tick={<CustomTick/>}
            interval={0}
            tickMargin={10}
          />
          <YAxis
            tick={{ fill: "#333", fontSize: 10 }}
            axisLine={{ stroke: "#ccc" }} // Y-Axis Line
            tickLine={{ stroke: "#ccc" }} // Y-Axis Tick Lines
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "8px",
              border: "1px solid #ddd",
              boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
            }}
          />
          <Bar dataKey="score" barSize={30} fill="#28a745" radius={[5, 5, 0, 0]}  animationDuration={1500} >
            <LabelList dataKey="score" position="top" fill="#333" fontSize={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VerticalBarChart;
