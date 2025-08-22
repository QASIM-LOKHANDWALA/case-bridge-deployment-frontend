import React, { useState, useEffect } from "react";
import {
    User,
    Calendar,
    Users,
    MessageCircle,
    Shield,
    Bell,
    LogOut,
    Briefcase,
    Home,
    Wallet,
    Menu,
    X,
} from "lucide-react";
import Profile from "../components/lawyerHome/Profile";
import useAuth from "../hooks/useAuth";
import Clients from "../components/lawyerHome/Clients";
import Cases from "../components/lawyerHome/Cases";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Appointments from "../components/lawyerHome/Appointments";
import LawyerPayments from "../components/lawyerHome/LawyerPayments";
import axiosInstance from "../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const LawyerHome = () => {
    const [activeTab, setActiveTab] = useState("profile");
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [clients, setClients] = useState([]);
    const [cases, setCases] = useState([]);
    const { user, token, error, logout } = useAuth();
    const navigate = useNavigate();

    const fetchClients = async () => {
        const lawyerId = user.lawyer_profile.id;
        const response = await axiosInstance.get(
            `/api/lawyers/clients/${lawyerId}/`,
            {
                headers: {
                    Authorization: `Token ${token}`,
                },
            }
        );
        if (isDev) console.log(response.data);
        setClients(response.data);
    };

    const fetchCases = async () => {
        const response = await axiosInstance.get(`/api/lawyers/cases`, {
            headers: {
                Authorization: `Token ${token}`,
            },
        });
        if (isDev) console.log(response.data);
        setCases(response.data.cases);
    };

    useEffect(() => {
        fetchClients();
        fetchCases();
    }, []);

    const handleCaseAdded = (newCase) => {
        setCases((prev) => [...prev, newCase]);
    };

    const handleClientRequest = async (clientId, status) => {
        try {
            const response = await axiosInstance.patch(
                `/api/hire/${clientId}/respond/`,
                {
                    status: status,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                fetchClients();
                if (isDev)
                    console.log(
                        "Client hire request accepted: ",
                        response.data
                    );
            }
        } catch (error) {
            if (isDev)
                console.error("Error accepting client hire request: ", error);
            toast.error(`Error accepting client hire request: ${error}`);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const data = await logout();

            toast.success("Logout Successfull!");
            navigate("/");
        } catch (err) {
            if (isDev) console.error("Auth error:", err);
            toast.error(`Logout failed. ${error ? error : err.message}`);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    const renderContent = () => {
        switch (activeTab) {
            case "profile":
                return <Profile />;
            case "appointments":
                return <Appointments clients={clients} />;
            case "cases":
                return (
                    <Cases
                        cases={cases}
                        onCaseAdded={handleCaseAdded}
                        fetchCases={fetchCases}
                        clients={clients.filter(
                            (client) => client.hire_status === "accepted"
                        )}
                    />
                );
            case "payments":
                return <LawyerPayments clients={clients} token={token} />;
            case "clients":
                return (
                    <Clients
                        clients={clients}
                        fetchClients={fetchClients}
                        handleClientRequest={handleClientRequest}
                    />
                );
            default:
                return null;
        }
    };

    const navigationItems = [
        { id: "profile", label: "Profile", icon: User },
        { id: "cases", label: "My Cases", icon: Briefcase },
        { id: "clients", label: "Clients", icon: Users },
        { id: "appointments", label: "Appointments", icon: Calendar },
        { id: "payments", label: "Payments", icon: Wallet },
        {
            id: "messages",
            label: "Messages",
            icon: MessageCircle,
            action: () => navigate("/chat"),
        },
    ];

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            {/* Header */}
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 relative z-30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Mobile menu button */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                        >
                            {sidebarOpen ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <Menu className="w-5 h-5" />
                            )}
                        </button>

                        <div className="text-xl md:text-2xl font-bold text-white">
                            Case<span className="text-emerald-400">Bridge</span>
                        </div>
                        <div className="hidden md:block text-sm text-gray-400">
                            Lawyer Dashboard
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="flex items-center space-x-2 md:space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs md:text-sm font-medium text-white truncate max-w-24 md:max-w-none">
                                    {user.lawyer_profile.full_name}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Advocate
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                <nav
                    className={`
                    fixed md:relative
                    left-0 top-0 h-full
                    w-64 md:w-64
                    bg-gray-800 border-r border-gray-700
                    transform transition-transform duration-300 ease-in-out
                    z-30 md:z-0
                    overflow-y-auto
                    ${
                        sidebarOpen
                            ? "translate-x-0"
                            : "-translate-x-full md:translate-x-0"
                    }
                    pt-16 md:pt-0
                `}
                >
                    <div className="p-4">
                        <div className="space-y-2">
                            {navigationItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() =>
                                        item.action
                                            ? item.action()
                                            : handleTabChange(item.id)
                                    }
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                        activeTab === item.id
                                            ? "bg-emerald-600 text-white"
                                            : "text-gray-400 hover:text-white hover:bg-gray-700"
                                    }`}
                                >
                                    <item.icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="truncate">
                                        {item.label}
                                    </span>
                                </button>
                            ))}

                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                >
                                    <LogOut className="w-5 h-5 flex-shrink-0" />
                                    <span className="truncate">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 overflow-y-auto p-3 md:p-6">
                    <div className="max-w-full">{renderContent()}</div>
                </main>
            </div>

            <div className="md:hidden bg-gray-800 border-t border-gray-700 px-2 py-2">
                <div className="flex justify-around">
                    {navigationItems.slice(0, 5).map((item) => (
                        <button
                            key={item.id}
                            onClick={() =>
                                item.action
                                    ? item.action()
                                    : handleTabChange(item.id)
                            }
                            className={`flex flex-col items-center space-y-1 px-2 py-2 rounded-lg transition-colors ${
                                activeTab === item.id
                                    ? "text-emerald-400"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="text-xs truncate max-w-16">
                                {item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LawyerHome;
