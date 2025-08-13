import React, { useState, useEffect } from "react";
import {
    Search,
    Filter,
    Shield,
    User,
    Home,
    Calendar,
    MessageCircle,
    FileText,
    Bell,
    LogOut,
    Users,
    X,
    Wallet,
} from "lucide-react";
import LawyerCard from "../components/clientHome/LawyerCard";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DiscoverLawyers from "../components/clientHome/DiscoverLawyers";
import Appointments from "../components/clientHome/Appointments";
import ClientPayment from "../components/clientHome/ClientPayment";
import axiosInstance from "../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const ClientHome = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [showNotifications, setShowNotifications] = useState(false);
    const [lawyers, setLawyers] = useState([]);
    const [requests, setRequests] = useState([]);
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const fetchLawyers = async () => {
        try {
            const response = await axiosInstance.get("/api/lawyers/list/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });
            if (isDev) console.log(`Fetch Lawyers Response : `, response.data);

            if (response.status === 200) {
                setLawyers(response.data);
            }
        } catch (error) {
            toast.error(`Error fetching lawyers: ${error}`);
        }
    };

    const fetchRequest = async () => {
        try {
            const response = await axiosInstance.get(
                "/api/hire/client/hire-requests/",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            if (isDev) console.log(`Fetch Requests Response : `, response.data);

            if (response.status === 200) {
                setRequests(response.data);
            }
        } catch (error) {
            if (isDev) console.log("Error fetching requests : ", error);
        }
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const data = await logout();
            toast.success("Logout Successful!");
            navigate("/");
        } catch (err) {
            toast.error(`Logout failed. ${err}`);
        }
    };

    useEffect(() => {
        fetchLawyers();
        fetchRequest();
    }, []);

    const specializations = [
        { value: "criminal", label: "Criminal Law" },
        { value: "civil", label: "Civil Law" },
        { value: "corporate", label: "Corporate Law" },
        { value: "family", label: "Family Law" },
        { value: "intellectual_property", label: "Intellectual Property Law" },
        { value: "general", label: "General Practice" },
    ];

    const getSpecializationLabel = (value) => {
        const spec = specializations.find((s) => s.value === value);
        return spec ? spec.label : value;
    };

    const notifications = [
        {
            id: 1,
            type: "request",
            title: "Request Accepted",
            message: "Adv. Sharma accepted your hire request",
            time: "2 hours ago",
            read: false,
        },
        {
            id: 2,
            type: "appointment",
            title: "Appointment Scheduled",
            message: "Meeting scheduled for tomorrow at 2:00 PM",
            time: "4 hours ago",
            read: false,
        },
        {
            id: 3,
            type: "document",
            title: "Document Request",
            message: "Your lawyer requested additional documents",
            time: "1 day ago",
            read: true,
        },
    ];

    const renderMyLawyers = () => {
        const handleRatingSubmit = (lawyerId, rating, newLawyerRating) => {
            setLawyers((prevLawyers) =>
                prevLawyers.map((lawyer) =>
                    lawyer.lawyer_profile.id === lawyerId
                        ? {
                              ...lawyer,
                              lawyer_profile: {
                                  ...lawyer.lawyer_profile,
                                  rating: newLawyerRating,
                              },
                          }
                        : lawyer
                )
            );
        };

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-white">
                        My Lawyers
                    </h2>
                </div>
                <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests
                        .filter((req) => req.status === "accepted")
                        .map((request) => {
                            const lawyer = lawyers.find(
                                (l) => l.lawyer_profile.id === request.lawyer
                            );
                            if (!lawyer) return null;
                            return (
                                <LawyerCard
                                    key={lawyer.id}
                                    lawyer={lawyer}
                                    getSpecializationLabel={
                                        getSpecializationLabel
                                    }
                                    handleSendRequest={null}
                                    hireStatus={request.status}
                                    showRating={true}
                                    onRatingSubmit={handleRatingSubmit}
                                />
                            );
                        })}
                </div>
                {requests.filter((req) => req.status === "accepted").length ===
                    0 && (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-white">
                            No hired lawyers yet
                        </h3>
                        <p className="text-gray-400">
                            Start by finding and hiring lawyers from the home
                            tab.
                        </p>
                    </div>
                )}
            </div>
        );
    };

    const renderCases = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-white">My Cases</h2>
            </div>
            <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">
                    No cases yet
                </h3>
                <p className="text-gray-400">
                    Your active cases will be displayed here.
                </p>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return (
                    <DiscoverLawyers
                        lawyers={lawyers}
                        requests={requests}
                        setRequests={setRequests}
                        specializations={specializations}
                        getSpecializationLabel={getSpecializationLabel}
                    />
                );
            case "my-lawyers":
                return renderMyLawyers();
            case "appointments":
                return <Appointments />;
            case "payments":
                return <ClientPayment token={token} />;
            case "cases":
                return renderCases();
            default:
                return (
                    <DiscoverLawyers
                        lawyers={lawyers}
                        requests={requests}
                        setRequests={setRequests}
                        specializations={specializations}
                        getSpecializationLabel={getSpecializationLabel}
                    />
                );
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-900">
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="text-2xl font-bold text-white">
                            Case<span className="text-blue-400">Bridge</span>
                        </div>
                        <div className="hidden md:block text-sm text-gray-400">
                            Client Dashboard
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <button
                                onClick={() =>
                                    setShowNotifications(!showNotifications)
                                }
                                className="text-gray-400 hover:text-white p-2 relative"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
                                    {
                                        notifications.filter((n) => !n.read)
                                            .length
                                    }
                                </span>
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
                                    <div className="p-4 border-b border-gray-700">
                                        <h4 className="font-semibold text-white">
                                            Notifications
                                        </h4>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="p-3 border-b border-gray-700 hover:bg-gray-700"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div
                                                        className={`w-2 h-2 rounded-full mt-2 ${
                                                            notification.read
                                                                ? "bg-gray-400"
                                                                : "bg-blue-400"
                                                        }`}
                                                    ></div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-white">
                                                            {notification.title}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {
                                                                notification.message
                                                            }
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {notification.time}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-400" />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-white">
                                    {user?.general_profile?.full_name}
                                </p>
                                <p className="text-xs text-gray-400">Client</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <nav className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto">
                    <div className="p-4">
                        <div className="space-y-2">
                            <button
                                onClick={() => setActiveTab("home")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "home"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <Home className="w-5 h-5" />
                                <span>Find Lawyers</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("my-lawyers")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "my-lawyers"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <Users className="w-5 h-5" />
                                <span>My Lawyers</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("cases")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "cases"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <FileText className="w-5 h-5" />
                                <span>My Cases</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("appointments")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "appointments"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <Calendar className="w-5 h-5" />
                                <span>Appointments</span>
                            </button>

                            <button
                                onClick={() => setActiveTab("payments")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                    activeTab === "payments"
                                        ? "bg-blue-600 text-white"
                                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                                }`}
                            >
                                <Wallet className="w-5 h-5" />
                                <span>Payments</span>
                            </button>

                            <button
                                onClick={() => navigate("/chat")}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>Messages</span>
                            </button>

                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="flex-1 overflow-y-auto p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default ClientHome;
