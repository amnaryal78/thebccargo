import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminShell } from '../../features/admin/shell/AdminShell';
import { AdminOverviewTab } from '../../features/admin/overview/AdminOverviewTab';
import { ShipmentsTab } from '../../features/admin/shipments/ShipmentsTab';
import { ShipmentEditorPage } from '../../features/admin/shipments/ShipmentEditorPage';
import { InquiriesTab } from '../../features/admin/inquiries/InquiriesTab';
import { HandlingRulesTab } from '../../features/admin/handling-rules/HandlingRulesTab';
import { HowToShipAdminTab } from '../../features/admin/how-to-ship/HowToShipAdminTab';
import { RatesTab } from '../../features/admin/rates/RatesTab';
import { BlogsTab } from '../../features/admin/blogs/BlogsTab';
import { CareersTab } from '../../features/admin/careers/CareersTab';
import { UsersTab } from '../../features/admin/users/UsersTab';
import { BookingsTab } from '../../features/admin/bookings/BookingsTab';
import { FeedbackTab } from '../../features/admin/feedback/FeedbackTab';
import { NotificationsTab } from '../../features/admin/notifications/NotificationsTab';
import { AuditLogTab } from '../../features/admin/audit/AuditLogTab';

export const AdminDashboardPage: React.FC = () => {
  return (
    <Routes>
      <Route element={<AdminShell />}>
        <Route index element={<AdminOverviewTab />} />
        <Route path="shipments" element={<ShipmentsTab />} />
        <Route path="shipments/:id" element={<ShipmentEditorPage />} />
        <Route path="inquiries" element={<InquiriesTab />} />
        <Route path="bookings" element={<BookingsTab />} />
        <Route path="feedback" element={<FeedbackTab />} />
        <Route path="notifications" element={<NotificationsTab />} />
        <Route path="handling-rules" element={<HandlingRulesTab />} />
        <Route path="how-to-ship" element={<HowToShipAdminTab />} />
        <Route path="rates" element={<RatesTab />} />
        <Route path="blogs" element={<BlogsTab />} />
        <Route path="careers" element={<CareersTab />} />
        <Route path="users" element={<UsersTab />} />
        <Route path="audit" element={<AuditLogTab />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
};
