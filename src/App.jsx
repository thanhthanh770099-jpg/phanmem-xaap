import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import QRCodePage from './components/QRCodePage';
import Login from './components/Login';
import Profile from './components/Profile';
import DocumentManager from './components/DocumentManager';
import Feedback from './components/Feedback';
import PublicFeedback from './components/PublicFeedback';
import PublicDanhSachLanhDao from './components/PublicDanhSachLanhDao';
import UserManagement from './components/UserManagement';

function App() {
  const [activeTab, setActiveTab] = useState(0); // 0 = Dashboard
  const [user, setUser] = useState(null);
  const [unreadDocCount, setUnreadDocCount] = useState(0);
  const [unreadFeedbackCount, setUnreadFeedbackCount] = useState(0);

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/documents/unread-count?userId=${user.id}`)
      const data = await res.json();
      setUnreadDocCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUnreadFeedbackCount = async () => {
    if (!user) return;
    try {
      const res = await fetch(`https://phanmem-xaap.onrender.com/api/feedbacks/unread-count?userId=${user.id}`)
      const data = await res.json();
      setUnreadFeedbackCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadFeedbackCount();
  }, [user]);

  const handleLogout = () => {
    setUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (window.location.pathname === '/phan-anh') {
    return <PublicFeedback />;
  }
  
  if (window.location.pathname === '/danh-sach-lanh-dao') {
    return <PublicDanhSachLanhDao />;
  }

  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <>
      <Header user={user} onLogout={handleLogout} setActiveTab={setActiveTab} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 70px)' }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} unreadDocCount={unreadDocCount} unreadFeedbackCount={unreadFeedbackCount} user={user} />
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f4f7f6' }}>
          {activeTab === 1 ? <DocumentManager user={user} unreadDocCount={unreadDocCount} refreshUnreadCount={fetchUnreadCount} />
            : activeTab === 2 ? <Feedback user={user} refreshUnreadFeedbackCount={fetchUnreadFeedbackCount} />
              : activeTab === 3 ? <QRCodePage />
                : activeTab === 4 ? <Profile user={user} onUserUpdate={handleUserUpdate} />
                  : activeTab === 6 ? <UserManagement user={user} />
                    : <Dashboard />}
        </div>
      </div>
    </>
  );
}

export default App;
