"use client";

import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, DatePicker, message } from "antd";
import { UserOutlined, CarOutlined, DollarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

export default function DashboardPage() {
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs());
  const [summary, setSummary] = useState({
    carServicesTotal: 0,
    suppliesTotal: 0,
    expensesTotal: 0,
  });

  const fetchSummary = async () => {
    try {
      const month = selectedMonthYear.month() + 1;
      const year = selectedMonthYear.year();

      const response = await fetch(`/api/summary?month=${month}&year=${year}`);
      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching summary:", error);
      message.error("Failed to fetch summary");
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [selectedMonthYear]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DatePicker.MonthPicker
        value={selectedMonthYear}
        onChange={(date) => setSelectedMonthYear(date || dayjs())}
        format="MMMM YYYY"
        className="mb-4"
      />
      <Row gutter={16} className="mt-4">
        <Col span={8}>
          <Card>
            <Statistic
              title="Car Services Total"
              value={summary.carServicesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Supplies Total"
              value={summary.suppliesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Expenses Total"
              value={summary.expensesTotal}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
