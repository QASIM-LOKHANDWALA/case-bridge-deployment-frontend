import React from "react";
import {
    User,
    MessageCircle,
    Search,
    Edit,
    Eye,
    Phone,
    Mail,
    Check,
    X,
    Briefcase,
    FileText,
    Users,
} from "lucide-react";

const isDev = import.meta.env.VITE_DEV;

const STATUS_COLORS = {
    pending: "bg-yellow-600/20 text-yellow-400",
    accepted: "bg-green-600/20 text-green-400",
    rejected: "bg-red-600/20 text-red-400",
    completed: "bg-emerald-600/20 text-emerald-400",
    cancelled: "bg-gray-600/20 text-gray-400",
};

const Clients = ({ clients, handleClientRequest, fetchClients }) => {
    const handleAccept = (clientId) => {
        if (isDev) console.log("Accepting client hire request:", clientId);
        if (handleClientRequest) handleClientRequest(clientId, "accepted");
    };
    const handleReject = (clientId) => {
        if (isDev) console.log("Rejecting client hire request:", clientId);
        if (handleClientRequest) handleClientRequest(clientId, "rejected");
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">My Clients</h3>
            </div>

            <div className="grid gap-4">
                {clients.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
                            <User className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h4 className="text-lg font-semibold text-white mb-2">
                                No clients found.
                            </h4>
                        </div>
                    </div>
                ) : (
                    clients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-gradient-to-br from-gray-800 to-gray-800/80 p-6 rounded-2xl border border-gray-700/50 hover:border-gray-600/70 transition-all duration-300 hover:shadow-lg hover:shadow-gray-900/20 group"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl flex items-center justify-center shadow-inner group-hover:from-gray-600 group-hover:to-gray-500 transition-all duration-300">
                                            <User className="w-7 h-7 text-gray-300" />
                                        </div>
                                        {client.hire_status === "accepted" && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white text-lg mb-1 group-hover:text-gray-100 transition-colors">
                                            {client.name}
                                        </h4>
                                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                                            <span className="flex items-center space-x-1">
                                                <Phone className="w-3 h-3" />
                                                <span>{client.phone}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <Mail className="w-3 h-3" />
                                                <span>{client.email}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`px-4 py-2 rounded-xl text-xs font-medium backdrop-blur-sm ${
                                            STATUS_COLORS[client.hire_status] ||
                                            "bg-gray-600/20 text-gray-400 border border-gray-600/30"
                                        }`}
                                    >
                                        {client.hire_status
                                            .charAt(0)
                                            .toUpperCase() +
                                            client.hire_status.slice(1)}
                                    </div>
                                    {client.hire_status === "pending" && (
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() =>
                                                    handleAccept(client.id)
                                                }
                                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 text-xs rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            >
                                                <Check className="w-3.5 h-3.5" />
                                                <span>Accept</span>
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleReject(client.id)
                                                }
                                                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 text-xs rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-xl border border-gray-600/20 hover:bg-gray-700/40 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                                            <Briefcase className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                                Active Cases
                                            </p>
                                            <p className="text-xl font-bold text-emerald-400 mt-1">
                                                {client.activeCases}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-700/30 backdrop-blur-sm p-4 rounded-xl border border-gray-600/20 hover:bg-gray-700/40 transition-all duration-200">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gray-600/30 rounded-lg flex items-center justify-center">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                                                Total Cases
                                            </p>
                                            <p className="text-xl font-bold text-gray-300 mt-1">
                                                {client.totalCases}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {client.activeCases > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-700/50">
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                        <span>Case Load</span>
                                        <span>
                                            {Math.round(
                                                (client.activeCases /
                                                    client.totalCases) *
                                                    100
                                            )}
                                            % of total
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                                        <div
                                            className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${
                                                    (client.activeCases /
                                                        client.totalCases) *
                                                    100
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Clients;
