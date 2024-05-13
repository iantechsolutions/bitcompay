"use client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "ene",
    total: 3124,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "feb",
    total: 8734,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "mar",
    total: 6734,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "abr",
    total: 4534,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "may",
    total: 9934,
  },
  {
    name: "jun",
    total: 6734,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "jul",
    total: 3344,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "ago",
    total: 3664,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "sep",
    total: 6534,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "oct",
    total: 3646,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "nov",
    total: 3456,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "dic",
    total: 5634,
    pv: 2400,
    amt: 2400,
  },
];

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={400}
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="total" stroke="#8884d8" fill="#8884d8" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
