"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";
export function RecentSales() {
  const data = [
    {
      name: "Pago facil",
      total: 1500,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Rapipago",
      total: 2000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Pagomiscuentas",
      total: 6000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Debito Directo Plus",
      total: 3000,
      pv: 2400,
      amt: 2400,
    },
    {
      name: "Debito Directo",
      total: 4000,
      pv: 2400,
      amt: 2400,
    },
  ];
  return (
    <div>
      <BarChart width={500} height={300} data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" hide={true} />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#8884d8">
          <LabelList dataKey="name" position="insideRight" />
        </Bar>
      </BarChart>
    </div>
  );
}
