"use client";

import { Button, Card } from "antd";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <div className="min-h-screen p-8">
      <Card title="Welcome" className="max-w-md mx-auto">
        <div className="space-y-4">
          <p>Username: {session?.user?.username}</p>
          <p>Role: {session?.user?.role}</p>
          <Button type="primary" danger onClick={handleLogout} block>
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
