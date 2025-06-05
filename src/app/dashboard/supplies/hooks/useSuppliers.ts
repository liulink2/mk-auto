import { useState, useCallback } from "react";
import { Supplier } from "../types";
import { MessageInstance } from "antd/es/message/interface";

export function useSuppliers(message: MessageInstance) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (!response.ok) throw new Error("Failed to fetch suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch {
      message.error("Failed to fetch suppliers");
    }
  }, [message]);

  return { suppliers, setSuppliers, fetchSuppliers };
}
