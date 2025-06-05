import { Card } from "antd";
import React from "react";

interface Summary {
  totalServices: number;
  finalAmount: number;
  totalCash: number;
  totalCard: number;
}

const SummaryCards: React.FC<{ summary: Summary }> = ({ summary }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <Card title="Total Services">{summary.totalServices}</Card>
      <Card title="Total Amount">${summary.finalAmount.toFixed(2)}</Card>
      <Card title="Paid in Cash">${summary.totalCash.toFixed(2)}</Card>
      <Card title="Paid in Card">${summary.totalCard.toFixed(2)}</Card>
    </div>
  );
};

export default SummaryCards;
