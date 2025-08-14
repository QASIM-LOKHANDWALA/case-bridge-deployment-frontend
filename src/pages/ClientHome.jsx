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
    Menu,
} from "lucide-react";
import LawyerCard from "../components/clientHome/LawyerCard";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import DiscoverLawyers from "../components/clientHome/DiscoverLawyers";
import Appointments from "../components/clientHome/Appointments";
import ClientPayment from "../components/clientHome/ClientPayment";
import axiosInstance from "../services/axiosInstance";
import Cases from "../components/clientHome/Cases";

const isDev = import.meta.env.VITE_DEV;

const ClientHome = () => {
    const [activeTab, setActiveTab] = useState("home");
    const [showNotifications, setShowNotifications] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [lawyers, setLawyers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [cases, setCases] = useState([]);
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

    const fetchCases = async () => {
        try {
            const response = await axiosInstance.get(
                `/api/lawyers/cases/client`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            if (isDev) console.log(response.data);
            setCases(response.data.cases);
        } catch (err) {
            console.log(`Error fetching cases: ${err.message}`);
            toast.error(err.message);
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

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    useEffect(() => {
        fetchLawyers();
        fetchCases();
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
                    <h3s className="text-lg font-semibold text-white">
                        My Lawyers
                    </h3s>
                </div>
                <div className="grid sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
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
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
                            <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h4 className="text-lg font-semibold text-white mb-2">
                                No hired lawyers yet
                            </h4>

                            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mt-4">
                                <div className="flex items-center justify-center space-x-2 text-blue-400">
                                    <Search className="w-5 h-5" />
                                    <span className="text-sm">
                                        Discover lawyers to hire.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // const renderCases = () => (
    //     <div className="space-y-6">
    //         <div className="flex items-center justify-between">
    //             <h2 className="text-xl md:text-2xl font-semibold text-white">
    //                 My Cases
    //             </h2>
    //         </div>
    //         <div className="text-center py-12">
    //             <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
    //             <h3 className="text-lg md:text-xl font-semibold mb-2 text-white">
    //                 No cases yet
    //             </h3>
    //             <p className="text-gray-400 text-sm md:text-base px-4">
    //                 Your active cases will be displayed here.
    //             </p>
    //         </div>
    //     </div>
    // );

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
                return <Cases cases={cases} />;
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

    const navigationItems = [
        { id: "home", label: "Find Lawyers", icon: Home },
        { id: "my-lawyers", label: "My Lawyers", icon: Users },
        { id: "cases", label: "My Cases", icon: FileText },
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
            <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 relative z-30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
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
                            Case<span className="text-blue-400">Bridge</span>
                        </div>
                        <div className="hidden md:block text-sm text-gray-400">
                            Client Dashboard
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="flex items-center space-x-2 md:space-x-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-700 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs md:text-sm font-medium text-white truncate max-w-24 md:max-w-none">
                                    {user?.general_profile?.full_name}
                                </p>
                                <p className="text-xs text-gray-400">Client</p>
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
                                            ? "bg-blue-600 text-white"
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
                                    ? "text-blue-400"
                                    : "text-gray-500 hover:text-gray-300"
                            }`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="text-xs truncate max-w-16">
                                {item.id === "home"
                                    ? "Find"
                                    : item.id === "my-lawyers"
                                    ? "Lawyers"
                                    : item.id === "cases"
                                    ? "Cases"
                                    : item.id === "appointments"
                                    ? "Appts"
                                    : item.label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ClientHome;
