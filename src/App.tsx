import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ClassTypes from "./pages/Classes/ClassTypes";
import ClassTypeCreate from "./pages/Classes/ClassTypeCreate";
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
import BoxDetailsPage from "./pages/Boxes/BoxDetailsPage";
import BoxSettingsPage from "./pages/Boxes/BoxSettingsPage";
import RoomsList from "./pages/Rooms/RoomsList";
import RoomsCreate from "./pages/Rooms/RoomsCreate";
import RoomsEdit from "./pages/Rooms/RoomsEdit";
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
import MemberCreate from "./pages/Members/MemberCreate";
import PaymentsList from "./pages/Payments/PaymentsList";

// 🔒 Importa o componente de proteção
import ProtectedRoute from "./components/auth/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* 🔒 Rotas protegidas pelo login */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          
          {/* Box Details Tab */}
            <Route path="/box-details" element={<BoxDetailsPage />} />
            <Route path="/settings/box" element={<BoxSettingsPage />} />

          {/* Members */}
          <Route path="/members" element={<MemberList />} />
          <Route path="/members/:id" element={<MemberDetail />} />
          <Route path="/members/new" element={<MemberCreate />} />

          {/* Boxes */}
          <Route
            path="/boxes"
            element={
              <ProtectedRoute requireSuperAdmin>
                <BoxList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/boxes/new"
            element={
              <ProtectedRoute requireSuperAdmin>
                <BoxForm />
              </ProtectedRoute>
            }
          />
          <Route path="/boxes/:id/edit" element={<BoxForm />} />
          <Route path="/boxes/members" element={<MemberBoxList />} />
          <Route path="/boxes/members/new" element={<MemberBoxForm />} />
          <Route path="/boxes/members/:id" element={<MemberBoxDetail />} />
          <Route path="/boxes/members/:id/edit" element={<MemberBoxForm />} />

          {/* Rooms */}
          <Route path="/rooms" element={<RoomsList />} />
          <Route path="/rooms/new" element={<RoomsCreate />} />
          <Route path="/rooms/:id/edit" element={<RoomsEdit />} />

          {/* Classes */}
          <Route path="/classes" element={<WeeklySchedule />} />
          <Route path="/classes/types" element={<ClassTypes />} />
          <Route path="/classes/types/new" element={<ClassTypeCreate />} />

          {/* Workouts */}
          <Route path="/workouts" element={<Planning />} />
          <Route path="/workouts/weeklyview" element={<WeeklyView />} />

          {/* Staff */}
          <Route path="/staff" element={<StaffList />} />
          <Route path="/staff/new" element={<StaffCreate />} />
          <Route path="/staff/:id/edit" element={<StaffEdit />} />

          {/* Planos */}
          <Route path="/plans" element={<PlanList />} />
          <Route path="/plans/new" element={<PlanCreate />} />
          <Route path="/plans/:id/edit" element={<PlanEdit />} />
          <Route path="/plans/sessionpacks" element={<SessionPackList />} />
          <Route
            path="/plans/sessionpacks/new"
            element={<SessionPackCreate />}
          />
          <Route
            path="/plans/sessionpacks/:id/edit"
            element={<SessionPackEdit />}
          />

          {/* Pagamentos */}
          <Route path="/payments" element={<PaymentsList />} />

          {/* Outros */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />
          <Route path="/form-elements" element={<FormElements />} />
          <Route path="/basic-tables" element={<BasicTables />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
        </Route>

        {/* 🔓 Rotas públicas (auth) */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Página 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
