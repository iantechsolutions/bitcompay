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
import { Cell } from "recharts";
import { ResponsiveContainer } from "recharts";

export function RecentSales() {
  const COLORS = ["#8DCDC1", "#6DB6A8", "#B9CCC8", "#578670", "#41776C"];
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
      total: 4000,
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
    <ResponsiveContainer width={"99%"} height={300}>
      <BarChart width={500} height={300} data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" hide={true} />
        <Tooltip />
        <Bar dataKey="total">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
          <LabelList dataKey="name" position="right" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
