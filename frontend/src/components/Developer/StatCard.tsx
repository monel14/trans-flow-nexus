
import React from "react";

type StatCardProps = {
  title: string;
  value: string | number;
};

const StatCard: React.FC<StatCardProps> = ({ title, value }) => (
  <div className="rounded-lg bg-white shadow p-6 flex flex-col items-center">
    <div className="text-3xl font-bold mb-2 text-blue-700">{value}</div>
    <div className="text-sm text-gray-600">{title}</div>
  </div>
);

export default StatCard;
