"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FC } from "react";

type UsagePoint = {
  date: string;
  ok: number;
  suspect: number;
  disposable: number;
};

const chartColors = {
  ok: "#22c55e",
  suspect: "#f97316",
  disposable: "#ef4444",
};

export const UsageChart: FC<{ data: UsagePoint[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="currentColor" />
        <YAxis stroke="currentColor" />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--background))",
            borderRadius: "0.75rem",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Area
          type="monotone"
          dataKey="ok"
          stackId="1"
          stroke={chartColors.ok}
          fill={chartColors.ok}
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="suspect"
          stackId="1"
          stroke={chartColors.suspect}
          fill={chartColors.suspect}
          fillOpacity={0.2}
        />
        <Area
          type="monotone"
          dataKey="disposable"
          stackId="1"
          stroke={chartColors.disposable}
          fill={chartColors.disposable}
          fillOpacity={0.2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
