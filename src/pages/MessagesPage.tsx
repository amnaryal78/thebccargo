import React from 'react';
import { MessagesInbox } from '../features/messages/MessagesInbox';

/** Mobile-friendly staff inbox reached from the "More" menu. Wrapped in ProtectedRoute by App. */
export const MessagesPage: React.FC = () => (
  <div className="px-4 py-6">
    <MessagesInbox />
  </div>
);
