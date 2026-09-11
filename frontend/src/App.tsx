import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/navigation/AppLayout";
import Dashboard from "./pages/Dashboard";
import NewEvent from "./pages/NewEvent";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import EventOrbit from "./pages/EventOrbit";
import Approvals from "./pages/Approvals";
import TasksPage from "./pages/Tasks";
import ActivityPage from "./pages/Activity";
import CalendarPage from "./pages/Calendar";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<NewEvent />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="events/:id/orbit" element={<EventOrbit />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="activity" element={<ActivityPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
