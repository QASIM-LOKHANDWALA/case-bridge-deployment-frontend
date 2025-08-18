import React, { useState, useEffect } from "react";
import {
    Plus,
    X,
    Calendar,
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Phone,
    Mail,
    MapPin,
    Filter,
    Search,
    Edit,
    Trash2,
    Video,
    UserCheck,
    CalendarDays,
    RefreshCw,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import axiosInstance from "../../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const Appointments = ({ clients }) => {
    const [appointments, setAppointments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [statusUpdateLoading, setStatusUpdateLoading] = useState({});
    const [dateFilter, setDateFilter] = useState("all");
    const [formData, setFormData] = useState({
        user_id: "",
        title: "",
        description: "",
        appointment_date: "",
        appointment_time: "",
        status: "scheduled",
    });
    const { token } = useAuth();

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        try {
            const response = await axiosInstance.get("/api/appointments/", {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            setAppointments(response.data || []);
        } catch (error) {
            if (isDev) console.error("Error fetching appointments:", error);
            toast.error("Failed to fetch appointments");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        const requiredFields = [
            "user_id",
            "title",
            "appointment_date",
            "appointment_time",
            "description",
        ];
        for (const field of requiredFields) {
            if (!formData[field]) {
                setError(`${field.replace("_", " ")} is required`);
                setIsLoading(false);
                return;
            }
        }

        try {
            const response = await axiosInstance.post(
                "/api/appointments/schedule-appointment/",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                closeModal();
                fetchAppointments();
                toast.success("Appointment scheduled successfully!");
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save appointment");
            if (isDev) console.error("Error saving appointment:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (appointmentId, newStatus) => {
        setStatusUpdateLoading((prev) => ({
            ...prev,
            [appointmentId]: newStatus,
        }));

        try {
            const response = await axiosInstance.patch(
                `/api/appointments/${appointmentId}/status/`,
                { status: newStatus },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setAppointments((prev) =>
                    prev.map((appointment) =>
                        appointment.id === appointmentId
                            ? { ...appointment, status: newStatus }
                            : appointment
                    )
                );

                fetchAppointments();
                toast.success(
                    `Appointment marked as ${newStatus.replace("_", " ")}`
                );
            }
        } catch (error) {
            if (isDev) console.error("Error updating status:", error);

            const errorMessage =
                error.response?.data?.error ||
                "Failed to update appointment status";
            toast.error(errorMessage);

            if (error.response?.status === 403) {
                console.error("Unauthorized to update this appointment");
            } else if (error.response?.status === 400) {
                console.error("Invalid status value provided");
            }
        } finally {
            setStatusUpdateLoading((prev) => {
                const newState = { ...prev };
                delete newState[appointmentId];
                return newState;
            });
        }
    };

    const handleDelete = async (appointmentId) => {
        if (
            !window.confirm("Are you sure you want to delete this appointment?")
        ) {
            return;
        }

        try {
            const response = await axiosInstance.delete(
                `/api/appointments/${appointmentId}/delete/`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 204) {
                fetchAppointments();
                toast.success("Appointment deleted successfully!");
            }
        } catch (error) {
            if (isDev) console.error("Error deleting appointment:", error);
            toast.error("Failed to delete appointment");
        }
    };

    const openModal = (appointment = null) => {
        setFormData({
            user_id: "",
            title: "",
            description: "",
            appointment_date: "",
            appointment_time: "",
            status: "scheduled",
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
        setFormData({
            user_id: "",
            title: "",
            description: "",
            appointment_date: "",
            appointment_time: "",
            status: "scheduled",
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "cancelled":
                return <XCircle className="w-4 h-4 text-red-400" />;
            case "scheduled":
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
            case "scheduled":
                return "bg-yellow-600/20 text-yellow-400";
            case "no_show":
                return "bg-orange-600/20 text-orange-400";
            default:
                return "bg-blue-600/20 text-blue-400";
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "court_hearing":
                return <CalendarDays className="w-4 h-4 text-purple-400" />;
            case "video_call":
                return <Video className="w-4 h-4 text-blue-400" />;
            case "phone_call":
                return <Phone className="w-4 h-4 text-green-400" />;
            default:
                return <UserCheck className="w-4 h-4 text-gray-400" />;
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
        const appointmentDateTime = new Date(`${date.split("T")[0]}T${time}`);
        return appointmentDateTime > new Date();
    };

    const filteredAppointments = appointments.filter((appointment) => {
        const client = clients.find((c) => c.id === appointment.user);
        const clientName = client ? client.name : "Unknown Client";

        const matchesSearch = clientName
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || appointment.status === statusFilter;

        let matchesDate = true;
        const appointmentDate = appointment.appointment_date.split("T")[0];
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
            matchesDate = appointmentDate === today;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    const StatusButton = ({
        appointmentId,
        currentStatus,
        targetStatus,
        label,
        bgColor,
        hoverColor,
        icon: Icon,
    }) => {
        const isLoading = statusUpdateLoading[appointmentId] === targetStatus;

        return (
            <button
                onClick={() => handleStatusUpdate(appointmentId, targetStatus)}
                disabled={isLoading || currentStatus === targetStatus}
                className={`${bgColor} ${hoverColor} text-white px-3 py-1 rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                    Icon && <Icon className="w-3 h-3" />
                )}
                <span>{label}</span>
            </button>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    Appointments
                </h3>
                <button
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                    <span>Schedule Appointment</span>
                </button>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by client name..."
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
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                                No appointments found
                            </h4>

                            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mt-4">
                                <div className="flex items-center justify-center space-x-2 text-blue-400">
                                    <User className="w-5 h-5" />
                                    <span className="text-sm">
                                        Scheduled appointments with clients will
                                        show here
                                    </span>
                                </div>
                            </div>
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
                                                {appointment.user?.full_name ||
                                                    "Unknown Client"}
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
                                                    {appointment.status.replace(
                                                        "_",
                                                        " "
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            {appointment.title}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() =>
                                                handleDelete(appointment.id)
                                            }
                                            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                                            title="Delete appointment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Date
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            {formatDate(
                                                appointment.appointment_date
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Time
                                        </p>
                                        <p className="text-sm text-blue-400">
                                            {formatTime(
                                                appointment.appointment_time
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Contact
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <p className="text-sm text-gray-300">
                                                {appointment.user
                                                    ?.phone_number || "—"}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Description
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            {appointment.description || "—"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {appointment.status === "scheduled" && (
                                        <>
                                            <StatusButton
                                                appointmentId={appointment.id}
                                                currentStatus={
                                                    appointment.status
                                                }
                                                targetStatus="completed"
                                                label="Mark Completed"
                                                bgColor="bg-green-600"
                                                hoverColor="hover:bg-green-700"
                                                icon={CheckCircle}
                                            />
                                            <StatusButton
                                                appointmentId={appointment.id}
                                                currentStatus={
                                                    appointment.status
                                                }
                                                targetStatus="cancelled"
                                                label="Cancel"
                                                bgColor="bg-red-600"
                                                hoverColor="hover:bg-red-700"
                                                icon={XCircle}
                                            />
                                        </>
                                    )}

                                    {appointment.status === "pending" && (
                                        <>
                                            <StatusButton
                                                appointmentId={appointment.id}
                                                currentStatus={
                                                    appointment.status
                                                }
                                                targetStatus="scheduled"
                                                label="Confirm"
                                                bgColor="bg-blue-600"
                                                hoverColor="hover:bg-blue-700"
                                                icon={Clock}
                                            />
                                            <StatusButton
                                                appointmentId={appointment.id}
                                                currentStatus={
                                                    appointment.status
                                                }
                                                targetStatus="cancelled"
                                                label="Cancel"
                                                bgColor="bg-red-600"
                                                hoverColor="hover:bg-red-700"
                                                icon={XCircle}
                                            />
                                        </>
                                    )}

                                    {appointment.status === "cancelled" && (
                                        <StatusButton
                                            appointmentId={appointment.id}
                                            currentStatus={appointment.status}
                                            targetStatus="scheduled"
                                            label="Reschedule"
                                            bgColor="bg-blue-600"
                                            hoverColor="hover:bg-blue-700"
                                            icon={Calendar}
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white">
                                Schedule New Appointment
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3 flex items-center space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                    <span className="text-red-400 text-sm">
                                        {error}
                                    </span>
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Client *
                                    </label>
                                    <select
                                        name="user_id"
                                        value={formData.user_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">
                                            -- Select Client --
                                        </option>
                                        {clients.map((client) => (
                                            <option
                                                key={client.id}
                                                value={client.id}
                                            >
                                                {client.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Calendar className="w-4 h-4 inline mr-1" />
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        name="appointment_date"
                                        value={formData.appointment_date}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        Time *
                                    </label>
                                    <input
                                        type="time"
                                        name="appointment_time"
                                        value={formData.appointment_time}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="scheduled">
                                            Scheduled
                                        </option>
                                        <option value="completed">
                                            Completed
                                        </option>
                                        <option value="cancelled">
                                            Cancelled
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter appointment title"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Additional description about the appointment"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Scheduling...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-4 h-4" />
                                            <span>Schedule Appointment</span>
                                        </>
                                    )}
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
