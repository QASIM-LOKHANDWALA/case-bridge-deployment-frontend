import React, { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    Search,
    CalendarDays,
    User,
    FileText,
    Eye,
    Filter,
    X,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import axiosInstance from "../../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFilter, setDateFilter] = useState("all");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const { token } = useAuth();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get(
                "/api/appointments/client/",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            if (isDev) console.log(response.data);
            setAppointments(response.data || []);
        } catch (error) {
            if (isDev) console.error("Error fetching appointments:", error);
            toast.error("Failed to fetch appointments");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "cancelled":
                return <XCircle className="w-4 h-4 text-red-400" />;
            case "pending":
                return <Clock className="w-4 h-4 text-yellow-400" />;
            case "no_show":
                return <AlertCircle className="w-4 h-4 text-orange-400" />;
            default:
                return <Clock className="w-4 h-4 text-blue-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-600/20 text-green-400";
            case "cancelled":
                return "bg-red-600/20 text-red-400";
            case "pending":
                return "bg-yellow-600/20 text-yellow-400";
            case "no_show":
                return "bg-orange-600/20 text-orange-400";
            default:
                return "bg-blue-600/20 text-blue-400";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString) => {
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString(
            "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    const isUpcoming = (date, time) => {
        const appointmentDateTime = new Date(`${date}T${time}`);
        return appointmentDateTime > new Date();
    };

    const openDetailModal = (appointment) => {
        setSelectedAppointment(appointment);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setSelectedAppointment(null);
        setIsDetailModalOpen(false);
    };

    const filteredAppointments = appointments.filter((appointment) => {
        const matchesSearch =
            appointment.title
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            appointment.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || appointment.status === statusFilter;

        let matchesDate = true;
        if (dateFilter === "upcoming") {
            matchesDate = isUpcoming(
                appointment.appointment_date,
                appointment.appointment_time
            );
        } else if (dateFilter === "past") {
            matchesDate = !isUpcoming(
                appointment.appointment_date,
                appointment.appointment_time
            );
        } else if (dateFilter === "today") {
            const today = new Date().toISOString().split("T")[0];
            matchesDate = appointment.appointment_date === today;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-300">
                    Loading appointments...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-white">
                        My Appointments
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                        View your scheduled appointments with your lawyer
                    </p>
                </div>
                <div className="bg-blue-600/20 text-blue-400 px-3 py-2 rounded-lg text-sm flex items-center space-x-2">
                    <CalendarDays className="w-4 h-4" />
                    <span>{appointments.length} Total</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search appointments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                </select>

                <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="past">Past</option>
                </select>
            </div>

            <div className="grid gap-4">
                {filteredAppointments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h4 className="text-lg font-semibold text-white mb-2">
                                No Appointments Found
                            </h4>
                            <p className="text-gray-400 mb-4">
                                {searchTerm ||
                                statusFilter !== "all" ||
                                dateFilter !== "all"
                                    ? "No appointments match your current filters."
                                    : "You don't have any appointments scheduled yet."}
                            </p>
                            {!searchTerm &&
                                statusFilter === "all" &&
                                dateFilter === "all" && (
                                    <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mt-4">
                                        <div className="flex items-center justify-center space-x-2 text-blue-400">
                                            <FileText className="w-5 h-5" />
                                            <span className="text-sm">
                                                Contact your lawyer to schedule
                                                an appointment
                                            </span>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </div>
                ) : (
                    filteredAppointments.map((appointment) => (
                        <div
                            key={appointment.id}
                            className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="font-semibold text-white">
                                                {appointment.title}
                                            </h4>
                                            <div
                                                className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(
                                                    appointment.status
                                                )}`}
                                            >
                                                {getStatusIcon(
                                                    appointment.status
                                                )}
                                                <span className="capitalize">
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            {isUpcoming(
                                                appointment.appointment_date,
                                                appointment.appointment_time
                                            ) &&
                                                appointment.status ===
                                                    "pending" && (
                                                    <div className="bg-green-600/20 text-green-400 px-2 py-1 rounded-full text-xs">
                                                        Upcoming
                                                    </div>
                                                )}
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">
                                            {appointment.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            openDetailModal(appointment)
                                        }
                                        className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Details</span>
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Date
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {formatDate(
                                                    appointment.appointment_date
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Time
                                            </p>
                                            <p className="text-sm text-blue-400">
                                                {formatTime(
                                                    appointment.appointment_time
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Client
                                            </p>
                                            <p className="text-sm text-gray-300">
                                                {appointment.user.full_name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isDetailModalOpen && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white">
                                Appointment Details
                            </h2>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-white">
                                    {selectedAppointment.title}
                                </h3>
                                <div
                                    className={`px-3 py-1 rounded-full text-sm flex items-center space-x-2 ${getStatusColor(
                                        selectedAppointment.status
                                    )}`}
                                >
                                    {getStatusIcon(selectedAppointment.status)}
                                    <span className="capitalize">
                                        {selectedAppointment.status}
                                    </span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date
                                        </label>
                                        <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                                            {formatDate(
                                                selectedAppointment.appointment_date
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            Time
                                        </label>
                                        <p className="text-blue-400 bg-gray-700 px-3 py-2 rounded-lg">
                                            {formatTime(
                                                selectedAppointment.appointment_time
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <User className="w-4 h-4 inline mr-1" />
                                            Client Name
                                        </label>
                                        <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                                            {selectedAppointment.user.full_name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            <Phone className="w-4 h-4 inline mr-1" />
                                            Phone Number
                                        </label>
                                        <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                                            {
                                                selectedAppointment.user
                                                    .phone_number
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Address
                                </label>
                                <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                                    {selectedAppointment.user.address}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <FileText className="w-4 h-4 inline mr-1" />
                                    Description
                                </label>
                                <p className="text-white bg-gray-700 px-3 py-3 rounded-lg leading-relaxed">
                                    {selectedAppointment.description}
                                </p>
                            </div>

                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <p className="text-xs text-gray-400 mb-1">
                                    Scheduled on
                                </p>
                                <p className="text-sm text-gray-300">
                                    {new Date(
                                        selectedAppointment.created_at
                                    ).toLocaleDateString("en-US", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={closeDetailModal}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
