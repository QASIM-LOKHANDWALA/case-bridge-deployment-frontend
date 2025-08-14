import React, { useState, useEffect } from "react";
import {
    User,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    Eye,
    CreditCard,
    RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const ClientPayment = ({ token }) => {
    const [paymentRequests, setPaymentRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [stats, setStats] = useState({
        total_paid: 0,
        total_pending: 0,
        completed_count: 0,
        pending_count: 0,
    });

    const fetchPaymentRequests = async () => {
        try {
            setIsLoading(true);
            const response = await axiosInstance.get(
                "/api/transactions/clients/payment-requests/",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (isDev) console.log("Fetch Payments : ", response);

            if (response.status === 200) {
                setPaymentRequests(response.data.payment_requests);
            } else {
                if (isDev) console.error("Failed to fetch payment requests");
                toast.error("Failed to fetch payment requests");
            }
        } catch (error) {
            if (isDev) console.error("Error fetching payment requests:", error);
            toast.error("Failed to fetch payment requests");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPaymentStats = async () => {
        try {
            const response = await axiosInstance.get(
                "/api/transactions/clients/payment-requests/stats/",
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                setStats(response.data);
            }
        } catch (error) {
            if (isDev) console.error("Error fetching payment stats:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchPaymentRequests();
            fetchPaymentStats();
        }
    }, [token]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => {
                resolve(true);
            };
            script.onerror = () => {
                resolve(false);
            };
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (requestId) => {
        const request = paymentRequests.find((r) => r.id === requestId);
        if (!request) return;

        setProcessingPayment(requestId);

        try {
            if (!request.razorpay_order_id) {
                try {
                    const response = await axiosInstance.post(
                        `/api/transactions/clients/payments/${request.id}/pay/`,
                        {},
                        {
                            headers: {
                                Authorization: `Token ${token}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                    if (response.status === 200) {
                        setPaymentRequests((prev) =>
                            prev.map((req) =>
                                req.id === requestId
                                    ? {
                                          ...req,
                                          status: "completed",
                                          paid_at: new Date().toISOString(),
                                      }
                                    : req
                            )
                        );

                        fetchPaymentStats();
                        toast.success("Payment completed successfully!");
                    }
                } catch (err) {
                    if (isDev) console.error("Simple payment error:", err);
                    toast.error("Payment processing failed.");
                }
                setProcessingPayment(null);
                return;
            }

            const res = await loadRazorpayScript();
            if (!res) {
                toast.error("Razorpay SDK failed to load. Are you online?");
                setProcessingPayment(null);
                return;
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: request.amount * 100,
                currency: "INR",
                name: "CaseBridge",
                description: request.description,
                order_id: request.razorpay_order_id,
                handler: async function (response) {
                    try {
                        await axiosInstance.post(
                            `/api/transactions/verify-payment/`,
                            {
                                transaction_id: request.id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id:
                                    response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            },
                            {
                                headers: {
                                    Authorization: `Token ${token}`,
                                    "Content-Type": "application/json",
                                },
                            }
                        );

                        setPaymentRequests((prev) =>
                            prev.map((req) =>
                                req.id === requestId
                                    ? {
                                          ...req,
                                          status: "completed",
                                          paid_at: new Date().toISOString(),
                                      }
                                    : req
                            )
                        );

                        fetchPaymentStats();

                        toast.success("Payment completed successfully!");
                    } catch (err) {
                        if (isDev)
                            console.error("Payment verification error:", err);
                        toast.error("Payment verification failed.");
                    }
                },
                prefill: {
                    name: request.lawyer.full_name,
                    email: request.lawyer.email,
                },
                theme: {
                    color: "#10b981",
                },
                modal: {
                    ondismiss: function () {
                        setProcessingPayment(null);
                    },
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", function (response) {
                if (isDev) console.error("Payment failed:", response.error);
                toast.error("Payment failed. Please try again.");
                setProcessingPayment(null);
            });

            razorpay.open();
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Something went wrong during payment.");
            setProcessingPayment(null);
        }
    };

    const openDetailModal = (request) => {
        setSelectedRequest(request);
        setIsDetailModalOpen(true);
    };

    const closeDetailModal = () => {
        setSelectedRequest(null);
        setIsDetailModalOpen(false);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-4 h-4 text-green-400" />;
            case "pending":
                return <Clock className="w-4 h-4 text-yellow-400" />;
            case "failed":
                return <XCircle className="w-4 h-4 text-red-400" />;
            case "refunded":
                return <RefreshCw className="w-4 h-4 text-blue-400" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-600/20 text-green-400 border-green-600/30";
            case "pending":
                return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30";
            case "failed":
                return "bg-red-600/20 text-red-400 border-red-600/30";
            case "refunded":
                return "bg-blue-600/20 text-blue-400 border-blue-600/30";
            default:
                return "bg-gray-600/20 text-gray-400 border-gray-600/30";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);
    };

    const pendingRequests = paymentRequests.filter(
        (req) => req.status === "pending"
    );
    const completedRequests = paymentRequests.filter(
        (req) => req.status === "completed"
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                    Payment Requests
                </h1>
                <p className="text-gray-400">
                    Manage your legal service payments
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Total Paid</p>
                            <p className="text-xl font-semibold text-green-400">
                                {formatCurrency(stats.total_paid || 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">
                                Pending Amount
                            </p>
                            <p className="text-xl font-semibold text-yellow-400">
                                {formatCurrency(stats.total_pending || 0)}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">
                                Pending Requests
                            </p>
                            <p className="text-xl font-semibold text-yellow-400">
                                {stats.pending_count || 0}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-yellow-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400">Completed</p>
                            <p className="text-xl font-semibold text-green-400">
                                {stats.completed_count || 0}
                            </p>
                        </div>
                        <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-green-400" />
                        </div>
                    </div>
                </div>
            </div>

            {pendingRequests.length > 0 && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
                    <div className="p-6 border-b border-gray-700">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-yellow-400" />
                            Pending Payment Requests
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {pendingRequests.map((request) => (
                            <div
                                key={request.id}
                                className="bg-gray-900 rounded-lg border border-yellow-600/30 p-4"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">
                                                {request.lawyer.full_name}
                                            </h4>
                                            <p className="text-sm text-gray-400">
                                                {request.lawyer.specialization}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-yellow-400">
                                            {formatCurrency(request.amount)}
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            {formatDate(request.timestamp)}
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-300 mb-4">
                                    {request.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => openDetailModal(request)}
                                        className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>View Details</span>
                                    </button>

                                    <button
                                        onClick={() =>
                                            handlePayment(request.id)
                                        }
                                        disabled={
                                            processingPayment === request.id
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {processingPayment === request.id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                <span>Pay Now</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-gray-800 rounded-xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">
                        Payment History
                    </h3>
                </div>
                <div className="p-6">
                    {paymentRequests.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                            <p>No payment requests found</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {paymentRequests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-gray-900 rounded-lg border border-gray-700 p-4 hover:border-gray-600 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-white">
                                                    {request.lawyer.full_name}
                                                </h5>
                                                <p className="text-sm text-gray-400">
                                                    ID: {request.id}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <p className="font-semibold text-white">
                                                    {formatCurrency(
                                                        request.amount
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {formatDate(
                                                        request.timestamp
                                                    )}
                                                </p>
                                            </div>

                                            <div
                                                className={`px-3 py-1 rounded-full text-xs border flex items-center space-x-1 ${getStatusColor(
                                                    request.status
                                                )}`}
                                            >
                                                {getStatusIcon(request.status)}
                                                <span className="capitalize">
                                                    {request.status}
                                                </span>
                                            </div>

                                            <button
                                                onClick={() =>
                                                    openDetailModal(request)
                                                }
                                                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                        <p className="text-sm text-gray-300">
                                            {request.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {isDetailModalOpen && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b border-gray-700">
                            <h2 className="text-xl font-semibold text-white">
                                Payment Request Details
                            </h2>
                            <button
                                onClick={closeDetailModal}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">
                                        Transaction ID
                                    </p>
                                    <p className="text-white font-medium">
                                        {selectedRequest.id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">
                                        Status
                                    </p>
                                    <div
                                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(
                                            selectedRequest.status
                                        )}`}
                                    >
                                        {getStatusIcon(selectedRequest.status)}
                                        <span className="capitalize">
                                            {selectedRequest.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400 mb-1">
                                    Lawyer
                                </p>
                                <div className="bg-gray-900 rounded-lg p-3">
                                    <p className="text-white font-medium">
                                        {selectedRequest.lawyer.full_name}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {selectedRequest.lawyer.specialization}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                        {selectedRequest.lawyer.email}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400 mb-1">
                                    Amount
                                </p>
                                <p className="text-2xl font-bold text-white">
                                    {formatCurrency(selectedRequest.amount)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-400 mb-1">
                                    Description
                                </p>
                                <p className="text-white">
                                    {selectedRequest.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-400 mb-1">
                                        Request Sent
                                    </p>
                                    <p className="text-white">
                                        {formatDate(selectedRequest.timestamp)}
                                    </p>
                                </div>
                                {selectedRequest.paid_at && (
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">
                                            Paid At
                                        </p>
                                        <p className="text-white">
                                            {formatDate(
                                                selectedRequest.paid_at
                                            )}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={closeDetailModal}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    Close
                                </button>

                                {selectedRequest.status === "pending" && (
                                    <button
                                        onClick={() => {
                                            closeDetailModal();
                                            handlePayment(selectedRequest.id);
                                        }}
                                        disabled={
                                            processingPayment ===
                                            selectedRequest.id
                                        }
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        {processingPayment ===
                                        selectedRequest.id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4" />
                                                <span>Pay Now</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientPayment;
