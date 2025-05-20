"use client";

import { Table, Button, Space, Popconfirm, App, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";

interface User {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
}

export default function UsersPage() {
  const { message } = App.useApp();
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (!hasRedirectedRef.current) {
      if (session?.user?.role !== "ADMIN") {
        hasRedirectedRef.current = true;
        message.error("You are not authorized to access this page");
        router.push("/dashboard");
        return;
      }
      fetchUsers();
    }
  }, [session, router, message]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/users");

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error(
        error instanceof Error ? error.message : "Failed to fetch users"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/users/${userId}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error("Failed to update user status");

      message.success(
        `User ${currentStatus ? "disabled" : "enabled"} successfully`
      );
      fetchUsers();
    } catch {
      message.error("Failed to update user status");
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      message.success("User deleted successfully");
      fetchUsers();
    } catch {
      message.error("Failed to delete user");
    }
  };

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (
        <span className={isActive ? "text-green-600" : "text-red-600"}>
          {isActive ? "Active" : "Disabled"}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: string, record: User) => {
        const isAdmin = record.role === "ADMIN";
        return (
          <Space>
            <Button
              type="text"
              icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record.id, record.isActive)}
              title={record.isActive ? "Disable User" : "Enable User"}
              disabled={isAdmin}
            />
            <Popconfirm
              title="Delete user"
              description="Are you sure you want to delete this user?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              disabled={isAdmin}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                title="Delete User"
                disabled={isAdmin}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
}
