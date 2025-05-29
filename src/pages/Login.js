import React, { useState } from "react";
import axios from "../api/api"; // Axios 인스턴스
import { useNavigate, useLocation } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import "./Login.css";

export const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [modalMessage, setModalMessage] = useState(""); // 모달 메시지
  const [showModal, setShowModal] = useState(false); // 모달 상태

  const navigate = useNavigate();
  const location = useLocation(); // 로그인 전 방문하려던 페이지 정보 저장

  const handleClose = () => setShowModal(false); // 모달 닫기
  const handleShow = (message) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // handleChange 함수 추가
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 취향 데이터 존재 여부 확인 함수 (기존 API 활용)
  const checkTasteData = async (accessToken, memberId) => {
    try {
      const endpoints = [
        `/api/members/${memberId}/tastes/genres`,
        `/api/members/${memberId}/tastes/likeFoods`,
        `/api/members/${memberId}/tastes/dislikeFoods`,
        `/api/members/${memberId}/tastes/dietaryPreferences`,
        `/api/members/${memberId}/tastes/spicyLevel`
      ];

      for (let endpoint of endpoints) {
        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        // 데이터가 비어있지 않으면 취향 데이터가 존재한다고 판단
        if (response.data.data.length > 0) {
          return true;
        }
      }

      return false; // 모든 API에서 데이터가 비어 있으면 false 반환
    } catch (error) {
      console.error("취향 데이터 확인 중 오류 발생:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("로그인 요청 시작 🚀"); // 로그 추가

      const response = await axios.post("/api/auth/login", formData);
      console.log("로그인 성공 :", response.data);

      const { accessToken, refreshToken, memberRole, memberId, nickname } = response.data.data;

      if (!accessToken) {
        console.error("🚨 accessToken이 없습니다! 서버 응답 확인 필요");
        handleShow("서버 오류: 액세스 토큰을 받을 수 없습니다.");
        return;
      }

      // 로컬 스토리지에 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("memberRole", memberRole);
      localStorage.setItem("memberId", memberId);
      localStorage.setItem("nickname", nickname);

      window.dispatchEvent(new Event("storage"));

      setShowModal(false);

      // 관리자라면 바로 /admin으로 이동
      if (memberRole === "ADMIN") {
        console.log("관리자 계정 → 관리자 페이지 이동 🚀");
        setTimeout(() => window.location.replace("/admin"), 300);
        return;
      }

      // 기존 취향 데이터 확인 API 호출
      console.log("취향 데이터 확인 요청 시작 🔍");
      const hasTasteData = await checkTasteData(accessToken, memberId);

      console.log("취향 데이터 응답 ✅:", hasTasteData);

      // 취향 데이터 유무에 따라 페이지 이동
      setTimeout(() => {
        if (hasTasteData) {
          console.log("취향 데이터 있음 → 메인 페이지 이동 🏠");
          window.location.replace("/");
        } else {
          console.log("취향 데이터 없음 → 취향 선택 페이지 이동 🍽️");
          window.location.replace("/taste-selection");
        }
      }, 300);
      
    } catch (error) {
      console.error("로그인 오류 ❌:", error);

      let errorMessage = "❌ 로그인에 실패했습니다.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage = "서버 응답이 없습니다.";
      } else {
        errorMessage = "요청 중 알 수 없는 오류 발생";
      }

      handleShow(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">로그인</h1>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="login-button">
          로그인
        </button>
      </form>
      <div className="login-footer">
        <span>계정이 없으신가요? </span>
        <a href="/signup">회원가입</a>
      </div>

      {/* 모달 컴포넌트 */}
      <Modal show={showModal} onHide={handleClose} centered>
        <Modal.Body>
          <p>{modalMessage}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="oauth-buttons">
  <a 
    href="http://localhost:8080/oauth2/authorization/google"
    className="google-login-button"
    >
    구글 로그인
  </a>

  <button
    type="button"
    className="kakao-login-button"
    onClick={() => handleShow("카카오 로그인은 현재 준비 중입니다🥲")}
  >
    카카오 로그인
  </button>
</div>

  {/* <a href="http://localhost:8080/oauth2/authorization/kakao" className="kakao-login-button">
    카카오 로그인
  </a>
</div> */}
    </div>

    
  );
};

export default Login;
