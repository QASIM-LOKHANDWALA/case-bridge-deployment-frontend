import React, { useState } from "react";
import {
    Mail,
    Lock,
    User,
    Phone,
    MapPin,
    Scale,
    Award,
    Calendar,
    FileText,
    Eye,
    EyeOff,
    ArrowRight,
    ArrowLeft,
    Shield,
    CheckCircle,
    ChevronRight,
} from "lucide-react";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const AuthPage = () => {
    const navigate = useNavigate();

    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        role: "general",
        full_name: "",
        phone_number: "",
        address: "",
        bar_registration_number: "",
        specialization: "",
        experience_years: "",
        location: "",
        bio: "",
    });

    const indianCities = [
        "Mumbai",
        "Delhi",
        "Bengaluru",
        "Hyderabad",
        "Ahmedabad",
        "Chennai",
        "Kolkata",
        "Pune",
        "Jaipur",
        "Surat",
        "Lucknow",
        "Kanpur",
        "Nagpur",
        "Indore",
        "Bhopal",
        "Patna",
        "Ludhiana",
        "Agra",
        "Nashik",
        "Vadodara",
        "Faridabad",
        "Ghaziabad",
        "Rajkot",
        "Meerut",
        "Amritsar",
        "Varanasi",
    ];

    const [message, setMessage] = useState("");

    const toggleMode = () => {
        setIsSignup(!isSignup);
        setCurrentStep(1);
        setFormData({
            email: "",
            password: "",
            role: "general",
            full_name: "",
            phone_number: "",
            address: "",
            bar_registration_number: "",
            specialization: "",
            experience_years: "",
            location: "",
            bio: "",
        });
        setMessage("");
    };

    const { login, signup, loading, error, isAuthenticated, user } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isSignup) {
                const data = await signup(formData);
                toast.success(`Welcome To CaseBridge!`);
            } else {
                const data = await login(formData);
                toast.success(`Logged in as ${data.user.email}`);
            }
            navigate("/home");
        } catch (err) {
            if (error) {
                toast.error(error);
            } else {
                toast.error(`Authentication failed. ${err}`);
            }
        }
    };

    const inputClasses =
        "w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200";
    const labelClasses = "block text-gray-300 font-medium mb-2";

    const isStep1Valid = () => {
        return (
            formData.full_name &&
            formData.email &&
            formData.password &&
            formData.role
        );
    };

    const isStep2Valid = () => {
        if (formData.role === "general") {
            return formData.phone_number && formData.address;
        } else if (formData.role === "lawyer") {
            return (
                formData.bar_registration_number &&
                formData.specialization &&
                formData.experience_years &&
                formData.location
            );
        }
        return false;
    };

    const getStepTitle = () => {
        if (!isSignup) return "Welcome Back";

        switch (currentStep) {
            case 1:
                return "Create Your Account";
            case 2:
                return formData.role === "lawyer"
                    ? "Professional Details"
                    : "Personal Information";
            case 3:
                return "Almost Done!";
            default:
                return "Create Your Account";
        }
    };

    const getStepDescription = () => {
        if (!isSignup) return "Continue your legal journey";

        switch (currentStep) {
            case 1:
                return "Let's start with the basics";
            case 2:
                return formData.role === "lawyer"
                    ? "Tell us about your practice"
                    : "Just a few more details";
            case 3:
                return "Complete your profile";
            default:
                return "Join thousands of legal professionals";
        }
    };

    const totalSteps = isSignup ? (formData.role === "lawyer" ? 3 : 2) : 1;

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
            <div className="relative w-full max-w-5xl">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    <div className="hidden lg:block">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-white mb-4">
                                Welcome to{" "}
                                <span className="text-blue-400">
                                    <Link to="/">Case Bridge</Link>
                                </span>
                            </h1>
                            <p className="text-gray-300 text-lg">
                                Your complete legal solution for modern India
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">
                                            Secure & Trusted
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Bank-level security for your data
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                        <Scale className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">
                                            Legal Expertise
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Connect with verified lawyers
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold">
                                            AI-Powered
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            Smart legal assistance 24/7
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-700">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400">
                                        Trusted by
                                    </span>
                                    <span className="text-white font-semibold">
                                        50,000+ Users
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8 shadow-2xl">
                            {isSignup && (
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-400">
                                            Step {currentStep} of {totalSteps}
                                        </span>
                                        <span className="text-sm text-gray-400">
                                            {Math.round(
                                                (currentStep / totalSteps) * 100
                                            )}
                                            % Complete
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-blue-600 to-blue-500 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                width: `${
                                                    (currentStep / totalSteps) *
                                                    100
                                                }%`,
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {getStepTitle()}
                                </h2>
                                <p className="text-gray-400">
                                    {getStepDescription()}
                                </p>
                            </div>

                            <div className="space-y-6">
                                {!isSignup && (
                                    <>
                                        <div>
                                            <label className={labelClasses}>
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    className={inputClasses}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClasses}>
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="Enter your password"
                                                    className={inputClasses}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <Eye className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {isSignup && currentStep === 1 && (
                                    <>
                                        <div>
                                            <label className={labelClasses}>
                                                Full Name
                                            </label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    name="full_name"
                                                    value={formData.full_name}
                                                    onChange={handleChange}
                                                    placeholder="Enter your full name"
                                                    className={inputClasses}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClasses}>
                                                Email Address
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="Enter your email"
                                                    className={inputClasses}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClasses}>
                                                Password
                                            </label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type={
                                                        showPassword
                                                            ? "text"
                                                            : "password"
                                                    }
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    placeholder="Enter your password"
                                                    className={inputClasses}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-5 h-5" />
                                                    ) : (
                                                        <Eye className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClasses}>
                                                I am a
                                            </label>
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="w-full pl-4 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                                            >
                                                <option value="general">
                                                    General User
                                                </option>
                                                <option value="lawyer">
                                                    Legal Professional
                                                </option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {isSignup && currentStep === 2 && (
                                    <>
                                        {formData.role === "general" && (
                                            <>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                    >
                                                        Phone Number
                                                    </label>
                                                    <div className="relative">
                                                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="tel"
                                                            name="phone_number"
                                                            value={
                                                                formData.phone_number
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder="Your phone number"
                                                            className={
                                                                inputClasses
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                    >
                                                        Address
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                                        <textarea
                                                            name="address"
                                                            value={
                                                                formData.address
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder="Your address"
                                                            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 resize-none"
                                                            rows="4"
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        {formData.role === "lawyer" && (
                                            <>
                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                    >
                                                        Bar Registration Number
                                                    </label>
                                                    <div className="relative">
                                                        <Scale className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <input
                                                            type="text"
                                                            name="bar_registration_number"
                                                            value={
                                                                formData.bar_registration_number
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            placeholder="Your bar registration number"
                                                            className={
                                                                inputClasses
                                                            }
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                    >
                                                        Specialization
                                                    </label>
                                                    <div className="relative">
                                                        <Award className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            name="specialization"
                                                            value={
                                                                formData.specialization
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                                                            required
                                                        >
                                                            <option value="">
                                                                Select your
                                                                specialization
                                                            </option>
                                                            <option value="civil">
                                                                Civil Law
                                                            </option>
                                                            <option value="criminal">
                                                                Criminal Law
                                                            </option>
                                                            <option value="corporate">
                                                                Corporate Law
                                                            </option>
                                                            <option value="family">
                                                                Family Law
                                                            </option>
                                                            <option value="intellectual_property">
                                                                Intellectual
                                                                Property Law
                                                            </option>
                                                            <option value="general">
                                                                General Law
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                    >
                                                        Years of Experience
                                                    </label>
                                                    <div className="relative">
                                                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            name="experience_years"
                                                            value={
                                                                formData.experience_years
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
                                                            required
                                                        >
                                                            <option value="">
                                                                Select
                                                                experience
                                                            </option>
                                                            <option value="0-2">
                                                                0-2 years
                                                            </option>
                                                            <option value="3-5">
                                                                3-5 years
                                                            </option>
                                                            <option value="6-10">
                                                                6-10 years
                                                            </option>
                                                            <option value="11-15">
                                                                11-15 years
                                                            </option>
                                                            <option value="16-20">
                                                                16+ years
                                                            </option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label
                                                        className={labelClasses}
                                                    >
                                                        Location
                                                    </label>
                                                    <div className="relative">
                                                        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                        <select
                                                            name="location"
                                                            value={
                                                                formData.location
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                            className={`${inputClasses} pl-10 appearance-none`}
                                                            required
                                                        >
                                                            <option value="">
                                                                Select your
                                                                practice
                                                                location
                                                            </option>
                                                            {indianCities.map(
                                                                (
                                                                    city,
                                                                    index
                                                                ) => (
                                                                    <option
                                                                        key={
                                                                            index
                                                                        }
                                                                        value={
                                                                            city
                                                                        }
                                                                    >
                                                                        {city}
                                                                    </option>
                                                                )
                                                            )}
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}

                                {isSignup &&
                                    currentStep === 3 &&
                                    formData.role === "lawyer" && (
                                        <div>
                                            <label className={labelClasses}>
                                                Professional Bio
                                            </label>
                                            <div className="relative">
                                                <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                                <textarea
                                                    name="bio"
                                                    value={formData.bio}
                                                    onChange={handleChange}
                                                    placeholder="Tell us about your legal expertise and experience..."
                                                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 resize-none"
                                                    rows="6"
                                                />
                                            </div>
                                            <p className="text-gray-400 text-sm mt-2">
                                                This will be displayed on your
                                                profile to help clients
                                                understand your expertise.
                                            </p>
                                        </div>
                                    )}

                                <div className="flex gap-4">
                                    {isSignup && currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={prevStep}
                                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                            <span>Back</span>
                                        </button>
                                    )}

                                    {isSignup && currentStep < totalSteps ? (
                                        <button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={
                                                currentStep === 1
                                                    ? !isStep1Valid()
                                                    : !isStep2Valid()
                                            }
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            <span>Continue</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <span>
                                                        {isSignup
                                                            ? "Create Account"
                                                            : "Sign In"}
                                                    </span>
                                                    <ArrowRight className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* {message && (
                                    <div className="text-center p-4 bg-green-600/20 border border-green-600/50 rounded-lg text-green-400">
                                        {message}
                                    </div>
                                )} */}

                                <div className="text-center pt-6 border-t border-gray-700">
                                    <p className="text-gray-400">
                                        {isSignup
                                            ? "Already have an account?"
                                            : "Don't have an account?"}
                                        <button
                                            type="button"
                                            onClick={toggleMode}
                                            className="text-blue-400 hover:text-blue-300 font-semibold ml-2 transition-colors"
                                        >
                                            {isSignup ? "Sign In" : "Sign Up"}
                                        </button>
                                    </p>
                                </div>

                                {!isSignup && (
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                        >
                                            Forgot your password?
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
