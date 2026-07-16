import { Layout } from "@/components/Layout";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import NotFound from "./NotFound";

const Index = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default Index;
