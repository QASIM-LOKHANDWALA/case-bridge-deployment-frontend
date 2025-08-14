import React, { useState, useEffect } from "react";
import {
    MapPin,
    Star,
    Users,
    MessageCircle,
    ArrowRight,
    CheckCircle,
    Award,
    Clock,
} from "lucide-react";
import axiosInstance from "../../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const getStatusColor = (status) => {
    switch (status) {
        case "pending":
            return "bg-yellow-500 text-yellow-100";
        case "completed":
            return "bg-green-500 text-green-100";
        case "refunded":
            return "bg-blue-500 text-blue-100";
        case "failed":
            return "bg-red-500 text-red-100";
        default:
            return "bg-gray-600 text-gray-200";
    }
};

const StarRating = ({ rating, onRatingChange, isEditable = false }) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    return (
        <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={!isEditable}
                    className={`${
                        isEditable
                            ? "cursor-pointer hover:scale-110 transition-transform"
                            : "cursor-default"
                    }`}
                    onClick={() => isEditable && onRatingChange(star)}
                    onMouseEnter={() => isEditable && setHoveredRating(star)}
                    onMouseLeave={() => isEditable && setHoveredRating(0)}
                >
                    <Star
                        className={`w-5 h-5 ${
                            star <= (hoveredRating || rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-400"
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

const LawyerCard = ({
    lawyer,
    getSpecializationLabel,
    handleSendRequest,
    hireStatus,
    onRatingSubmit,
    showRating = false,
}) => {
    const [userRating, setUserRating] = useState({
        hasRated: false,
        rating: 0,
        loading: false,
    });
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [selectedRating, setSelectedRating] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);

    useEffect(() => {
        if (showRating && hireStatus === "accepted") {
            checkUserRating();
        }
    }, [lawyer.lawyer_profile.id, showRating, hireStatus]);

    const checkUserRating = async () => {
        try {
            setUserRating((prev) => ({ ...prev, loading: true }));
            const token = localStorage.getItem("token");

            const response = await axiosInstance.get(
                `/api/lawyers/check-lawyer-rating/?lawyer_id=${lawyer.lawyer_profile.id}`,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                const data = response.data;
                setUserRating({
                    hasRated: data.has_rated,
                    rating: data.rating || 0,
                    loading: false,
                });
            } else {
                if (isDev)
                    console.error(
                        "Error checking rating:",
                        response.statusText
                    );
                setUserRating((prev) => ({ ...prev, loading: false }));
            }
        } catch (error) {
            if (isDev) console.error("Error checking rating:", error);
            setUserRating((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleRatingSubmit = async () => {
        if (selectedRating === 0) return;

        try {
            setSubmittingRating(true);
            const token = localStorage.getItem("token");

            const response = await axiosInstance.post(
                `/api/lawyers/rate/`,
                {
                    lawyer_id: lawyer.lawyer_profile.id,
                    rating: selectedRating,
                },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                const data = response.data;
                setUserRating({
                    hasRated: true,
                    rating: selectedRating,
                    loading: false,
                });
                setShowRatingForm(false);
                setSelectedRating(0);

                if (onRatingSubmit) {
                    onRatingSubmit(
                        lawyer.lawyer_profile.id,
                        selectedRating,
                        data.new_rating
                    );
                }

                alert("Rating submitted successfully!");
            } else {
                const errorData = await response.json();
                if (isDev) console.error("Error submitting rating:", errorData);
                alert("Failed to submit rating. Please try again.");
            }
        } catch (error) {
            if (isDev) console.error("Error submitting rating:", error);
            alert("Network error. Please check your connection and try again.");
        } finally {
            setSubmittingRating(false);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-600/50 transition-all duration-300 hover:transform group">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {lawyer.lawyer_profile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {lawyer.lawyer_profile.full_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-blue-400">
                                {getSpecializationLabel(
                                    lawyer.lawyer_profile.specialization
                                )}
                            </span>
                            {lawyer.lawyer_profile.is_verified && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-white">
                            {lawyer.lawyer_profile.rating}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{lawyer.lawyer_profile.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{lawyer.lawyer_profile.experience_years} exp</span>
                </div>
            </div>

            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {lawyer.lawyer_profile.bio}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-green-400" />
                        <div>
                            <div className="text-xs text-gray-400">
                                Serving Cases
                            </div>
                            <div className="text-sm font-semibold text-white">
                                {lawyer.number_of_cases}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <div>
                            <div className="text-xs text-gray-400">
                                Serving Clients
                            </div>
                            <div className="text-sm font-semibold text-white">
                                {lawyer.number_of_clients}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {showRating && hireStatus === "accepted" && (
                <div className="mb-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">
                            Your Rating
                        </h4>
                        {userRating.loading && (
                            <div className="text-xs text-gray-400">
                                Loading...
                            </div>
                        )}
                    </div>

                    {!userRating.loading && (
                        <>
                            {userRating.hasRated ? (
                                <div className="flex items-center space-x-2">
                                    <StarRating rating={userRating.rating} />
                                    <span className="text-sm text-gray-300">
                                        You rated this lawyer{" "}
                                        {userRating.rating}/5
                                    </span>
                                </div>
                            ) : (
                                <div>
                                    {!showRatingForm ? (
                                        <button
                                            onClick={() =>
                                                setShowRatingForm(true)
                                            }
                                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                        >
                                            Rate this lawyer
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-sm text-gray-300 block mb-2">
                                                    Rate your experience:
                                                </label>
                                                <StarRating
                                                    rating={selectedRating}
                                                    onRatingChange={
                                                        setSelectedRating
                                                    }
                                                    isEditable={true}
                                                />
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={handleRatingSubmit}
                                                    disabled={
                                                        selectedRating === 0 ||
                                                        submittingRating
                                                    }
                                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-md transition-colors"
                                                >
                                                    {submittingRating
                                                        ? "Submitting..."
                                                        : "Submit"}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setShowRatingForm(
                                                            false
                                                        );
                                                        setSelectedRating(0);
                                                    }}
                                                    className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-md transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="flex space-x-2">
                {hireStatus === "none" ? (
                    <button
                        onClick={() =>
                            handleSendRequest(lawyer.lawyer_profile.id)
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>Send Request</span>
                    </button>
                ) : (
                    <div
                        className={`flex-1 py-3 px-4 rounded-lg font-medium text-center text-sm ${getStatusColor(
                            hireStatus
                        )}`}
                    >
                        {hireStatus.charAt(0).toUpperCase() +
                            hireStatus.slice(1)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LawyerCard;
