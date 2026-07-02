import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute.jsx'
import { PublicLayout } from '../layouts/PublicLayout.jsx'
import StudentLayout from '../layouts/StudentLayout.jsx'
import { AdminLayout } from '../layouts/AdminLayout.jsx'
import { Home } from '../pages/public/Home.jsx'
import { Login } from '../pages/public/Login.jsx'
import { Register } from '../pages/public/Register.jsx'
import { Unauthorized } from '../pages/public/Unauthorized.jsx'
import { NotFound } from '../pages/public/NotFound.jsx'
import { StudentDashboard } from '../pages/student/Dashboard.jsx'
import { CreateReport } from '../pages/student/CreateReport.jsx'
import { ReportFoundItem } from '../pages/student/ReportFoundItem.jsx'
import { ReportLostItem } from '../pages/student/ReportLostItem.jsx'
import { MatchSuggestions } from '../pages/student/MatchSuggestions.jsx'
import { SearchItems } from '../pages/student/SearchItems.jsx'
import { StudentLostItems } from '../pages/student/LostItems.jsx'
import { StudentMyReports } from '../pages/student/MyReports.jsx'
import { AdminDashboard } from '../pages/admin/Dashboard.jsx'
import { AdminPostItems } from '../pages/admin/PostItems.jsx'
import { AdminReports } from '../pages/admin/ManageReports.jsx'
import { AdminUsers } from '../pages/admin/Users.jsx'
import { ReportChat } from '../pages/admin/ReportChat.jsx'
import { StudentReportChat } from '../pages/student/StudentReportChat.jsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="unauthorized" element={<Unauthorized />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path="student/dashboard" element={<StudentDashboard />} />
          <Route path="student/match-suggestions" element={<MatchSuggestions />} />
          <Route path="student/search-items" element={<SearchItems />} />
          <Route path="student/report-found-item" element={<ReportFoundItem />} />
          <Route path="student/report-lost-item" element={<ReportLostItem />} />
          <Route path="student/create-report" element={<CreateReport />} />
          <Route path="student/create" element={<Navigate to="/student/create-report" replace />} />
          <Route path="student/lost-items" element={<StudentLostItems />} />
          <Route path="student/lost" element={<Navigate to="/student/lost-items" replace />} />
          <Route path="student/reports" element={<StudentMyReports />} />
          <Route path="student/chat/:reportType/:reportId" element={<StudentReportChat />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/post-items" element={<AdminPostItems />} />
          <Route path="admin/reports" element={<AdminReports />} />
          <Route path="admin/chat/:reportType/:reportId" element={<ReportChat />} />
          <Route path="admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
      <Route path="/dashboard" element={<Navigate to="/student/dashboard" replace />} />
    </Routes>
  )
}