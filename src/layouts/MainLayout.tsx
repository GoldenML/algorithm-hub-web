import { Layout, Menu, Typography, theme } from "antd";
import {
  HomeOutlined,
  OrderedListOutlined,
  ApartmentOutlined,
  AimOutlined,
  BlockOutlined,
  SearchOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const { Header, Sider, Content, Footer } = Layout;

const menuItems = [
  { key: "/", icon: <HomeOutlined />, label: "首页" },
  { key: "/sorting", icon: <OrderedListOutlined />, label: "排序算法" },
  { key: "/graph-search", icon: <ApartmentOutlined />, label: "深度/广度搜索" },
  { key: "/greedy", icon: <AimOutlined />, label: "贪心算法" },
  { key: "/dynamic-programming", icon: <BlockOutlined />, label: "动态规划" },
  { key: "/binary-search", icon: <SearchOutlined />, label: "二分查找" },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        theme="dark"
        width={220}
        breakpoint="lg"
        collapsedWidth="0"
        style={{ position: "sticky", top: 0, height: "100vh", overflow: "auto" }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            Algorithm Hub
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingInline: 24,
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Typography.Text strong style={{ fontSize: 16 }}>
            算法学习手册 · 可视化 + 代码 + 详解
          </Typography.Text>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "inherit" }}
          >
            <GithubOutlined style={{ fontSize: 18 }} />
          </a>
        </Header>
        <Content style={{ padding: 24, maxWidth: 1200, width: "100%", margin: "0 auto" }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: "center" }}>
          Algorithm Hub · 用 React 打造的算法学习站
        </Footer>
      </Layout>
    </Layout>
  );
}
