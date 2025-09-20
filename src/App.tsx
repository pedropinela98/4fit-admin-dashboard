import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import MemberBoxList from "./pages/Boxes/MemberList";
import MemberBoxForm from "./pages/Boxes/MemberForm";
import MemberBoxDetail from "./pages/Boxes/MemberDetail";
import BoxList from "./pages/Boxes/BoxList";
import BoxForm from "./pages/Boxes/BoxForm";
import WeeklySchedule from "./pages/Classes/WeeklySchedule";
import Planning from "./pages/Workouts/Planning";
import WeeklyView from "./pages/Workouts/WeeklyView";
import StaffList from "./pages/Staff/StaffList";
import StaffCreate from "./pages/Staff/StaffCreate";
import StaffEdit from "./pages/Staff/StaffEdit";
import PlanList from "./pages/Plans/PlanList";
import PlanCreate from "./pages/Plans/PlanCreate";
import PlanEdit from "./pages/Plans/PlanEdit";
import SessionPackList from "./pages/Plans/SessionPlanList";
import SessionPackCreate from "./pages/Plans/SessionPlanCreate";
import SessionPackEdit from "./pages/Plans/SessionPlanEdit";
import MemberList from "./pages/Members/MembersList";
import MemberDetail from "./pages/Members/MemberDetail";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Members */}
            <Route path="/members" element={<MemberList />} />
            <Route path="/members/:id" element={<MemberDetail />} />
            {/* <Route path="/members/new" element={<MemberForm />} />
            <Route path="/members/:id/edit" element={<MemberForm />} /> */}

            {/* Boxes */}
            <Route path="/boxes" element={<BoxList />} />
            <Route path="/boxes/new" element={<BoxForm />} />
            <Route path="/boxes/:id/edit" element={<BoxForm />} />
            <Route path="/boxes/members" element={<MemberBoxList />} />
            <Route path="/boxes/members/new" element={<MemberBoxForm />} />
            <Route path="/boxes/members/:id" element={<MemberBoxDetail />} />
            <Route path="/boxes/members/:id/edit" element={<MemberBoxForm />} />

            {/* Classes */}
            <Route path="/classes" element={<WeeklySchedule />} />

            {/* Workouts */}
            <Route path="/workouts" element={<Planning />} />
            <Route path="/workouts/weeklyview" element={<WeeklyView />} />

            {/* Staff */}
            <Route path="/staff" element={<StaffList />} />
            {/* Criar staff */}
            <Route path="/staff/new" element={<StaffCreate />} />

            {/* Editar staff */}
            <Route path="/staff/:id/edit" element={<StaffEdit />} />

            {/* Plano */}
            <Route path="/plans" element={<PlanList />} />
            <Route path="/plans/new" element={<PlanCreate />} />
            <Route path="/plans/:id/edit" element={<PlanEdit />} />
            {/* Senhas */}
            <Route path="/plans/sessionpacks" element={<SessionPackList />} />
            <Route
              path="/plans/sessionpacks/new"
              element={<SessionPackCreate />}
            />
            <Route
              path="/plans/sessionpacks/:id/edit"
              element={<SessionPackEdit />}
            />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
