import { Card, Row, Col, Statistic } from "antd";
import { UserOutlined, CarOutlined, DollarOutlined } from "@ant-design/icons";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={1128}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Vehicles"
              value={93}
              prefix={<CarOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Revenue"
              value={8846}
              prefix={<DollarOutlined />}
              suffix="$"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
