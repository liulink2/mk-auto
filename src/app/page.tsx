"use client";

import { Button, Card } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen p-8">
      <Card title="Welcome to MK Auto" className="max-w-md mx-auto">
        <div className="space-y-4">
          <p className="text-center text-gray-600">
            Please log in to access the system
          </p>
          <Button type="primary" onClick={() => router.push("/login")} block>
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
