import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import ClassTypes from "./pages/Classes/ClassTypes";
import ClassTypeCreate from "./pages/Classes/ClassTypeCreate";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
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
import InsuranceEdit from "./pages/Plans/InsuranceEdit";
import InsuranceList from "./pages/Plans/InsuranceList";
import { ToastProvider } from "./components/ui/Toast";

// 🔒 Importa o componente de proteção
import ProtectedRoute from "./components/auth/ProtectedRoute";
import InsuranceCreate from "./pages/Plans/InsuranceCreate";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <ToastProvider>
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
            <Route path="/box/:boxId/members" element={<MemberList />} />
            <Route path="/box/:boxId/members/:id" element={<MemberDetail />} />
            <Route path="/box/:boxId/members/new" element={<MemberCreate />} />

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

            {/* Rooms */}
            <Route path="/box/:boxId/rooms" element={<RoomsList />} />
            <Route path="/box/:boxId/rooms/new" element={<RoomsCreate />} />
            <Route
              path="/box/:boxId/rooms/:id/editRoom"
              element={<RoomsEdit />}
            />

            {/* Classes */}
            <Route path="/classes" element={<WeeklySchedule />} />
            <Route path="/classes/types" element={<ClassTypes />} />
            <Route path="/classes/types/new" element={<ClassTypeCreate />} />

            {/* Workouts */}
            <Route path="/workouts" element={<Planning />} />
            <Route path="/workouts/weeklyview" element={<WeeklyView />} />

            {/* Staff */}
            <Route path="/box/:boxId/staff" element={<StaffList />} />
            <Route path="/box/:boxId/staff/new" element={<StaffCreate />} />
            <Route path="/box/:boxId/staff/:id/edit" element={<StaffEdit />} />

            {/* Planos */}
            <Route path="/box/:boxId/plans" element={<PlanList />} />
            <Route path="/box/:boxId/plans/new" element={<PlanCreate />} />
            <Route path="/box/:boxId/plans/:id/edit" element={<PlanEdit />} />
            {/* Planos de senhas */}
            <Route
              path="/box/:boxId/sessionpacks"
              element={<SessionPackList />}
            />
            <Route
              path="/box/:boxId/sessionpacks/new"
              element={<SessionPackCreate />}
            />
            <Route
              path="/box/:boxId/sessionpacks/:id/edit"
              element={<SessionPackEdit />}
            />

            {/* Seguros */}
            <Route path="/box/:boxId/insurances" element={<InsuranceList />} />
            <Route
              path="/box/:boxId/insurances/:id/edit"
              element={<InsuranceEdit />}
            />
            <Route
              path="/box/:boxId/insurances/new"
              element={<InsuranceCreate />}
            />
            {/* Pagamentos */}
            <Route path="/payments" element={<PaymentsList />} />

            {/* Outros */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />
          </Route>

          {/* 🔓 Rotas públicas (auth) */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Página 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </Router>
  );
}
