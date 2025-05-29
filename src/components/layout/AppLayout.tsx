"use client";

import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => router.push("/dashboard"),
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "Users",
      onClick: () => router.push("/dashboard/users"),
    },
    {
      key: "suppliers",
      icon: <ShopOutlined />,
      label: "Suppliers",
      onClick: () => router.push("/dashboard/suppliers"),
    },
    {
      key: "supplies",
      icon: <ShoppingCartOutlined />,
      label: "Supplies",
      onClick: () => router.push("/dashboard/supplies"),
    },
    {
      key: "expenses",
      icon: <DollarOutlined />,
      label: "Expenses",
      onClick: () => router.push("/dashboard/expenses"),
    },
    {
      key: "car-services",
      icon: <CarOutlined />,
      label: "Car Services",
      onClick: () => router.push("/dashboard/car-services"),
    },
  ];

  if (!session) {
    return null;
  }

  // Get the current section from the pathname
  const currentSection = pathname.split("/")[2] || "dashboard";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold">MK Autoteck</h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[currentSection]}
          items={menuItems}
          style={{ flex: 1 }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            borderTop: "1px solid #f0f0f0",
            background: "#fff",
          }}
        >
          <Menu
            mode="inline"
            items={[
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Logout",
                onClick: () => signOut(),
              },
            ]}
          />
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
          }}
        >
          <div className="flex justify-end items-center h-full">
            <span className="mr-4">Welcome, {session.user?.username}</span>
          </div>
        </Header>
        <Content
          style={{ margin: "24px 16px", padding: 24, background: "#fff" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
