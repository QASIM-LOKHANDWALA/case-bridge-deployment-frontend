import React, { useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ClientHome from "./pages/ClientHome";
import ChatPage from "./pages/ChatPage";
import toast, { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import LawyerHome from "./pages/LawyerHome";

const App = () => {
    const { user } = useAuth();

    return (
        <div>
            <Routes>
                <Route
                    path="/"
                    element={
                        user != null ? (
                            user.role === "general" ? (
                                <ClientHome />
                            ) : (
                                <LawyerHome />
                            )
                        ) : (
                            <LandingPage />
                        )
                    }
                />
                <Route
                    path="/auth"
                    element={
                        user != null ? (
                            user.role === "general" ? (
                                <ClientHome />
                            ) : (
                                <LawyerHome />
                            )
                        ) : (
                            <AuthPage />
                        )
                    }
                />
                <Route
                    path="/home"
                    element={
                        user != null ? (
                            user.role === "general" ? (
                                <ClientHome />
                            ) : (
                                <LawyerHome />
                            )
                        ) : (
                            <AuthPage />
                        )
                    }
                />
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
            <Toaster />
        </div>
    );
};

export default App;
