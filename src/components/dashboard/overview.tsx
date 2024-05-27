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
    <ResponsiveContainer width={"99%"} height={250}>
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
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1bdfb7" stopOpacity={1.0} />
            <stop offset="90%" stopColor="#1bdfb7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#1bdfb7"
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
