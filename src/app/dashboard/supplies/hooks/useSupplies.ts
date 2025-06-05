import { useState, useCallback } from "react";
import dayjs, { Dayjs } from "dayjs";
import { Supply } from "../types";
import { MessageInstance } from "antd/es/message/interface";

export function useSupplies(message: MessageInstance) {
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSupplies = useCallback(
    async (selectedDate: Dayjs) => {
      try {
        setLoading(true);
        const month = selectedDate.month() + 1;
        const year = selectedDate.year();
        const response = await fetch(
          `/api/supplies?month=${month}&year=${year}`
        );
        if (!response.ok) throw new Error("Failed to fetch supplies");
        const data = await response.json();
        setSupplies(data);
      } catch {
        message.error("Failed to fetch supplies");
      } finally {
        setLoading(false);
      }
    },
    [message]
  );

  return { date, setDate, supplies, setSupplies, loading, fetchSupplies };
}
