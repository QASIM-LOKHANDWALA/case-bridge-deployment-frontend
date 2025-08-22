import React, { useEffect } from "react";
import {
    User,
    Shield,
    Edit,
    Phone,
    Mail,
    MapPin,
    Star,
    Award,
    Calendar,
    Users,
    Upload,
    FileText,
    AlertTriangle,
    Loader2,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import EditProfileModal from "./EditProfileModal";
import axiosInstance from "../../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const Profile = () => {
    const { user, token, profile, error } = useAuth();
    const [isDocUploading, setIsDocUploading] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

    const getExperienceText = (experienceYears) => {
        const experienceMap = {
            "0-2": "0-2 years",
            "3-5": "3-5 years",
            "6-10": "6-10 years",
            "11-15": "11-15 years",
            "16+": "16+ years",
        };
        return experienceMap[experienceYears] || experienceYears;
    };

    const getSpecializationText = (specialization) => {
        const specializationMap = {
            criminal: "Criminal Law",
            civil: "Civil Law",
            corporate: "Corporate Law",
            family: "Family Law",
            intellectual_property: "Intellectual Property Law",
            general: "General Practice",
        };
        return specializationMap[specialization] || specialization;
    };

    const [documentForm, setDocumentForm] = React.useState({
        photo_id: null,
        cop: null,
    });

    const handleDocumentUpload = async (e) => {
        e.preventDefault();
        setIsDocUploading(true);
        const formData = new FormData();
        if (documentForm.photo_id)
            formData.append("photo_id", documentForm.photo_id);
        if (documentForm.cop) formData.append("cop", documentForm.cop);

        try {
            const response = await axiosInstance.post(
                "/api/lawyers/documents/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Token ${token}`,
                    },
                }
            );
            if (response.status === 201) {
                const response = await profile();
                if (isDev) console.log("Profile refresh: ", response.data);

                toast.success("Documents uploaded successfully");
            }
            handleProfileUpdate();
        } catch (error) {
            if (isDev)
                console.error(
                    "Document upload failed:",
                    error.response?.data || error.message
                );
            toast.error("Failed to upload documents");
        } finally {
            setIsDocUploading(false);
        }
    };

    const handleProfileUpdate = async () => {
        try {
            await profile();
            if (error) {
                toast.error(error);
                return;
            }
        } catch (error) {
            toast.error("Failed to refresh profile data");
        }
    };

    useEffect(() => {
        handleProfileUpdate();
    }, []);

    return (
        <div className="space-y-6">
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                token={token}
                onProfileUpdate={handleProfileUpdate}
            />

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white">
                        Profile Information
                    </h3>
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                                {user.lawyer_profile.profile_picture ? (
                                    <img
                                        src={`http://localhost:8000/${user.lawyer_profile.profile_picture}`}
                                        alt={user.lawyer_profile.full_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-gray-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="text-xl font-semibold text-white">
                                    {user.lawyer_profile.full_name}
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <Shield
                                        className={`w-4 h-4 ${
                                            user.lawyer_profile.is_verified
                                                ? "text-green-400"
                                                : "text-gray-400"
                                        }`}
                                    />
                                    <span
                                        className={`text-sm ${
                                            user.lawyer_profile.is_verified
                                                ? "text-green-400"
                                                : "text-gray-400"
                                        }`}
                                    >
                                        {user.lawyer_profile.is_verified
                                            ? "Verified by Bar Council"
                                            : "Verification Pending"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300">
                                    {user?.email || "Email not available"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300">
                                    {user.lawyer_profile.location}
                                </span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-300">
                                    Member since{" "}
                                    {new Date(
                                        user.lawyer_profile.created_at
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h5 className="font-medium text-white mb-2">
                                Professional Details
                            </h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">
                                        Bar Registration:
                                    </span>
                                    <span className="text-gray-300">
                                        {
                                            user.lawyer_profile
                                                .bar_registration_number
                                        }
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">
                                        Specialization:
                                    </span>
                                    <span className="text-gray-300">
                                        {getSpecializationText(
                                            user.lawyer_profile.specialization
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">
                                        Experience:
                                    </span>
                                    <span className="text-gray-300">
                                        {getExperienceText(
                                            user.lawyer_profile.experience_years
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">
                                        User Role:
                                    </span>
                                    <span className="text-emerald-400 capitalize">
                                        {user?.role || "Lawyer"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {user.lawyer_profile.bio && (
                            <div>
                                <h5 className="font-medium text-white mb-2">
                                    About
                                </h5>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {user.lawyer_profile.bio}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                        {user.lawyer_profile.rating.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${
                                    i < Math.floor(user.lawyer_profile.rating)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-400"
                                }`}
                            />
                        ))}
                    </div>
                    <p className="text-sm text-gray-400">Client Rating</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                        {user.number_of_cases}
                    </div>
                    <div className="flex items-center justify-center mb-1">
                        <Award className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-sm text-gray-400">Active Cases</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl font-bold text-white mb-2">
                        {user.number_of_clients}
                    </div>
                    <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-sm text-gray-400">Clients Served</p>
                </div>
            </div>

            {user?.lawyer_profile?.documents === null && (
                <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 border border-amber-700/50 rounded-xl p-6 backdrop-blur-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-amber-600/20 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-amber-300">
                                Document Verification Required
                            </h3>
                            <p className="text-sm text-amber-200/80">
                                Complete your verification to unlock all
                                features
                            </p>
                        </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-300 mb-3">
                            Please upload the following documents to complete
                            your verification:
                        </p>
                        <div className="flex flex-col space-y-2 text-sm">
                            <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-emerald-400" />
                                <span className="text-gray-300">
                                    Valid Photo ID (Aadhaar, PAN, Driving
                                    License)
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FileText className="w-4 h-4 text-green-400" />
                                <span className="text-gray-300">
                                    Certificate of Practice from Bar Council
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleDocumentUpload} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-amber-300">
                                    Photo ID Document
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        name="photo_id"
                                        accept="application/pdf,image/*"
                                        onChange={(e) =>
                                            setDocumentForm({
                                                ...documentForm,
                                                photo_id: e.target.files[0],
                                            })
                                        }
                                        required
                                        className="hidden"
                                        id="photo-id-upload"
                                    />
                                    <label
                                        htmlFor="photo-id-upload"
                                        className="w-full bg-gray-700/50 hover:bg-gray-700/70 border-2 border-dashed border-gray-600 hover:border-blue-500 text-gray-300 p-6 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 min-h-[120px]"
                                    >
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm font-medium">
                                            {documentForm.photo_id
                                                ? documentForm.photo_id.name
                                                : "Choose Photo ID"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            PDF, JPG, PNG up to 10MB
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-amber-300">
                                    Certificate of Practice
                                </label>
                                <div className="relative">
                                    <input
                                        type="file"
                                        name="cop"
                                        accept="application/pdf,image/*"
                                        onChange={(e) =>
                                            setDocumentForm({
                                                ...documentForm,
                                                cop: e.target.files[0],
                                            })
                                        }
                                        required
                                        className="hidden"
                                        id="cop-upload"
                                    />
                                    <label
                                        htmlFor="cop-upload"
                                        className="w-full bg-gray-700/50 hover:bg-gray-700/70 border-2 border-dashed border-gray-600 hover:border-green-500 text-gray-300 p-6 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 min-h-[120px]"
                                    >
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <span className="text-sm font-medium">
                                            {documentForm.cop
                                                ? documentForm.cop.name
                                                : "Choose Certificate"}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            PDF, JPG, PNG up to 10MB
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                            <div className="text-xs text-gray-400">
                                All documents will be securely encrypted and
                                reviewed within 24-48 hours
                            </div>
                            <button
                                type="submit"
                                disabled={
                                    isDocUploading ||
                                    !documentForm.photo_id ||
                                    !documentForm.cop
                                }
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg"
                            >
                                {isDocUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-4 h-4" />
                                        <span>Upload Documents</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;
