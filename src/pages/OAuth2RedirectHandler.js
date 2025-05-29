import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 현재 URL의 쿼리 파라미터를 읽음
    const queryParams = new URLSearchParams(window.location.search);
    const accessToken = queryParams.get("accessToken");
    const refreshToken = queryParams.get("refreshToken");
    const memberId = queryParams.get("memberId");
    const memberRole = queryParams.get("memberRole");
    const nickname = queryParams.get("nickname");

    if (accessToken && refreshToken && memberId && memberRole && nickname) {
      // 로컬 스토리지에 저장
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("memberId", memberId);
      localStorage.setItem("memberRole", memberRole);
      localStorage.setItem("nickname", nickname);

      window.dispatchEvent(new Event("storage")); // 상태 동기화 (예: 리덕스)

      // role 따라 리디렉션
      if (memberRole === "ADMIN") {
        window.location.replace("/admin");
      } else {
        window.location.replace("/");
      }
    } else {
      console.error("OAuth2 토큰 정보가 누락되었습니다.");
      navigate("/login"); // 에러 발생 시 로그인 페이지로 이동
    }
  }, [navigate]);

  return <div>로그인 중입니다... 잠시만 기다려 주세요 😊</div>;
};

export default OAuth2RedirectHandler;
