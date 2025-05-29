import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setTokens } from "./store/slices/authSlice";
import { Sidebar } from "./components/Sidebar";
import { AdminSidebar } from "./components/AdminSidebar";
import MypageSidebar from "./components/MypageSidebar";
import Main from "./pages/Main";
import { Signup } from "./pages/Signup";
import { Login } from "./pages/Login";
import Location from "./pages/Location";
import { connectWebSocket, disconnectWebSocket } from "./store/slices/chattingSlice";
import ChattingRoomList from "./pages/ChattingRoomList";
import ChattingRoom from "./pages/ChattingRoom";
import ChattingRoomCreate from "./pages/ChattingRoomCreate";
import Mypage from "./pages/Mypage";
import ProfileSettings from "./pages/ProfileSettings";
import UpdateProfile from "./pages/UpdateProfile";
import AdminMain from "./pages/AdminMain";
import MembersList from "./pages/MembersList";
import ChangePassword from "./pages/ChangePassword";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/ChatBot";
import PasswordVerifyPage from "./pages/PasswordVerifyPage";
import AccountDeletePage from "./pages/AccountDeletePage";
import TasteSelection from "./pages/TasteSelection";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";


function Layout() {
  const location = useLocation();
  const authPages = ["/change-password", "/forgot-password"];
  const isAuthPage = authPages.includes(location.pathname);
  const isMypage = location.pathname.startsWith("/mypage");

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const role = localStorage.getItem("memberRole");
    setIsAdmin(role === "ADMIN");
  }, []);

  return (
    <div className={`layout ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      {!isAuthPage && !isMypage && (
        isAdmin ? (
          <AdminSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        ) : (
          <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        )
      )}

      {isMypage && location.pathname !== "/account/delete" && (
        <MypageSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      )}
      <main className="content">
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/location" element={<Location />} />
          <Route path="/chatting/rooms" element={<ChattingRoomList />} />
          <Route path="/chatting/create" element={<ChattingRoomCreate />} />
          <Route path="/chatting/room/:roomId" element={<ChattingRoom />} />
          <Route path="/mypage" element={<Mypage />} />
          <Route path="/profile-settings" element={<ProfileSettings />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/mypage/change-password" element={<ChangePassword />} />
          <Route path="/taste-selection" element={<TasteSelection />} />

          {/* AI 채팅방 추가 */}
          <Route path="/chatting/room/ai" element={<ChatBot />} />

          {/* 비밀번호 검증 및 계정 삭제 추가 */}
          <Route path="/password/verify" element={<PasswordVerifyPage />} />
          <Route path="/account/delete" element={<AccountDeletePage />} />

          {/* ADMIN 전용 페이지 보호 */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminMain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admins/members"
            element={
              <ProtectedRoute>
                <MembersList />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const dispatch = useDispatch();
  const isConnected = useSelector((state) => state.chatting.isConnected);

  useEffect(() => {
    const role = localStorage.getItem("memberRole");
    const token = localStorage.getItem("accessToken");

    if (role && token) {
      dispatch(setTokens({ accessToken: token, memberRole: role }));
    }
  }, [dispatch]);

  useEffect(() => {
    const checkRoomsAndConnect = async () => {
      try {
        const response = await fetch("/api/chatting/rooms");
        const data = await response.json();

        if (data.length > 0 && !isConnected) {
          dispatch(connectWebSocket());
        }
      } catch (error) {
        console.error("채팅방 조회 실패:", error);
      }
    };

    checkRoomsAndConnect();

    return () => {
      if (isConnected) {
        dispatch(disconnectWebSocket());
      }
    };
  }, [dispatch, isConnected]);

  return (
    <Router>
      <Routes>
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
        <Route path="/*" element={<Layout />} />
      </Routes>
    </Router>
  );
}

export default App;