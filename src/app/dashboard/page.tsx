"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Statistic, DatePicker, App, Divider } from "antd";
import dayjs, { Dayjs } from "dayjs";

export default function DashboardPage() {
  const { message } = App.useApp();
  const [selectedMonthYear, setSelectedMonthYear] = useState(dayjs());
  const [summary, setSummary] = useState({
    carServicesTotal: 0,
    suppliesTotal: 0,
    expensesTotal: 0,
  });
  const [profitLoss, setProfitLoss] = useState(0);
  const [yearSummary, setYearSummary] = useState({
    carServicesTotal: 0,
    suppliesTotal: 0,
    expensesTotal: 0,
  });
  const [yearProfitLoss, setYearProfitLoss] = useState(0);

  const fetchSummary = useCallback(
    async (selectedDate: Dayjs) => {
      try {
        const month = selectedDate.month() + 1;
        const year = selectedDate.year();

        const response = await fetch(
          `/api/summary?month=${month}&year=${year}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch summary");
        }
        const data = await response.json();
        setSummary(data);
        const profitLoss =
          data.carServicesTotal - (data.suppliesTotal + data.expensesTotal);
        setProfitLoss(profitLoss);
      } catch (error) {
        console.error("Error fetching summary:", error);
        message.error("Failed to fetch summary");
      }
    },
    [message]
  );

  const fetchYearSummary = useCallback(
    async (selectedDate: Dayjs) => {
      try {
        const year = selectedDate.year();
        const response = await fetch(`/api/summary?year=${year}`);
        if (!response.ok) {
          throw new Error("Failed to fetch year summary");
        }
        const data = await response.json();
        setYearSummary(data);
        const profitLoss =
          data.carServicesTotal - (data.suppliesTotal + data.expensesTotal);
        setYearProfitLoss(profitLoss);
      } catch (error) {
        console.error("Error fetching year summary:", error);
        message.error("Failed to fetch year summary");
      }
    },
    [message]
  );

  useEffect(() => {
    fetchSummary(selectedMonthYear);
    fetchYearSummary(selectedMonthYear);
  }, [selectedMonthYear, fetchSummary, fetchYearSummary]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DatePicker.MonthPicker
        value={selectedMonthYear}
        onChange={(date) => setSelectedMonthYear(date || dayjs())}
        format="MMMM YYYY"
        className="mb-4"
      />
      <Divider>{`Summary of ${selectedMonthYear.year()}`}</Divider>
      <Row gutter={16} className="mt-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="Year Car Services Total"
              value={yearSummary.carServicesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Year Supplies Total"
              value={yearSummary.suppliesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Year Expenses Total"
              value={yearSummary.expensesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Year Profit & Loss"
              value={yearProfitLoss}
              prefix="$"
              valueStyle={{ color: yearProfitLoss > 0 ? "green" : "red" }}
            />
          </Card>
        </Col>
      </Row>
      <Divider>{`Summary of ${selectedMonthYear.format("MM/YYYY")}`}</Divider>

      <Row gutter={16} className="mt-4">
        <Col span={6}>
          <Card>
            <Statistic
              title="Car Services Total"
              value={summary.carServicesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Supplies Total"
              value={summary.suppliesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Expenses Total"
              value={summary.expensesTotal}
              prefix="$"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Profit & Loss"
              value={profitLoss}
              prefix="$"
              valueStyle={{ color: profitLoss > 0 ? "green" : "red" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
