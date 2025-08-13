import React, { useState } from "react";
import {
    X,
    User,
    Upload,
    Save,
    MapPin,
    FileText,
    Award,
    Building,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "../../services/axiosInstance";

const EditProfileModal = ({
    isOpen,
    onClose,
    user,
    token,
    onProfileUpdate,
}) => {
    const [formData, setFormData] = useState({
        full_name: user?.lawyer_profile?.full_name || "",
        bar_registration_number:
            user?.lawyer_profile?.bar_registration_number || "",
        specialization: user?.lawyer_profile?.specialization || "general",
        experience_years: user?.lawyer_profile?.experience_years || "0-2",
        location: user?.lawyer_profile?.location || "",
        bio: user?.lawyer_profile?.bio || "",
        profile_picture: null,
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const SPECIALIZATION_CHOICES = [
        { value: "criminal", label: "Criminal Law" },
        { value: "civil", label: "Civil Law" },
        { value: "corporate", label: "Corporate Law" },
        { value: "family", label: "Family Law" },
        { value: "intellectual_property", label: "Intellectual Property Law" },
        { value: "general", label: "General Practice" },
    ];

    const EXPERIENCE_CHOICES = [
        { value: "0-2", label: "0-2 years" },
        { value: "3-5", label: "3-5 years" },
        { value: "6-10", label: "6-10 years" },
        { value: "11-15", label: "11-15 years" },
        { value: "16+", label: "16+ years" },
    ];

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "number" ? parseInt(value) || 0 : value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, profile_picture: file });

            const reader = new FileReader();
            reader.onload = (e) => setPreviewImage(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const submitData = new FormData();

            Object.keys(formData).forEach((key) => {
                if (key === "profile_picture" && formData[key]) {
                    submitData.append(key, formData[key]);
                } else if (key !== "profile_picture") {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await axiosInstance.put(
                "/api/lawyers/update-profile/",
                submitData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                toast.success("Profile updated successfully!");
                onProfileUpdate();
                onClose();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to update profile. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (isOpen && user) {
            setFormData({
                full_name: user?.lawyer_profile?.full_name || "",
                bar_registration_number:
                    user?.lawyer_profile?.bar_registration_number || "",
                specialization:
                    user?.lawyer_profile?.specialization || "general",
                experience_years:
                    user?.lawyer_profile?.experience_years || "0-2",
                location: user?.lawyer_profile?.location || "",
                bio: user?.lawyer_profile?.bio || "",
                profile_picture: null,
            });
            setPreviewImage(null);
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">
                        Edit Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                            {previewImage ? (
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : user?.lawyer_profile?.profile_picture ? (
                                <img
                                    src={`http://localhost:8000/${user.lawyer_profile.profile_picture}`}
                                    alt={user.lawyer_profile.full_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <input
                                type="file"
                                id="profile-picture"
                                name="profile_picture"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="profile-picture"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer flex items-center space-x-2 transition-colors"
                            >
                                <Upload className="w-4 h-4" />
                                <span>Change Photo</span>
                            </label>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                                <User className="w-5 h-5" />
                                <span>Personal Information</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Location
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                        placeholder="City, State"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors resize-none"
                                    placeholder="Tell clients about yourself..."
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-white flex items-center space-x-2">
                                <Building className="w-5 h-5" />
                                <span>Professional Information</span>
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Bar Registration Number
                                </label>
                                <input
                                    type="text"
                                    name="bar_registration_number"
                                    value={formData.bar_registration_number}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Specialization
                                </label>
                                <select
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                >
                                    {SPECIALIZATION_CHOICES.map((choice) => (
                                        <option
                                            key={choice.value}
                                            value={choice.value}
                                        >
                                            {choice.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Experience
                                </label>
                                <select
                                    name="experience_years"
                                    value={formData.experience_years}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
                                >
                                    {EXPERIENCE_CHOICES.map((choice) => (
                                        <option
                                            key={choice.value}
                                            value={choice.value}
                                        >
                                            {choice.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;
