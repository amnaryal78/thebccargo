import React from 'react';
import { Navigate } from 'react-router-dom';

/** Old staff shortcut from the More menu: the inbox now lives inside the admin desk. */
export const MessagesPage: React.FC = () => <Navigate to="/admin/messages" replace />;
