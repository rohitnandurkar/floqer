// src/LineChart.tsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface LineChartProps {
  data: { year: number; totalJobs: number; averageSalary: number }[];
}

const SalaryLineChart: React.FC<LineChartProps> = ({ data }) => {
  return (
    <LineChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="year" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="totalJobs" stroke="#8884d8" />
      <Line type="monotone" dataKey="averageSalary" stroke="#82ca9d" />
    </LineChart>
  );
};

export default SalaryLineChart;
