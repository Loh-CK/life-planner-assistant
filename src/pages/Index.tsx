import { Layout } from "@/components/Layout";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import Calendar from "./Calendar";
import DayPlanner from "./DayPlanner";
import Tasks from "./Tasks";
import Expenses from "./Expenses";
import Notes from "./Notes";
import Pomodoro from "./Pomodoro";
import Settings from "./Settings";
import Help from "./Help";
import NotFound from "./NotFound";

const Index = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/day-planner" element={<DayPlanner />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

export default Index;
