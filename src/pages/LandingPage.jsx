import React, { useState, useEffect } from "react";
import {
    Search,
    Calendar,
    CreditCard,
    FileText,
    MessageCircle,
    Users,
    Shield,
    Clock,
    ArrowRight,
    Menu,
    X,
    Star,
    CheckCircle,
    Play,
    Gavel,
    Scale,
    BookOpen,
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState({});

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsVisible((prev) => ({
                            ...prev,
                            [entry.target.id]: true,
                        }));
                    }
                });
            },
            { threshold: 0.1 }
        );

        document.querySelectorAll("[id]").forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: <Search className="w-8 h-8" />,
            title: "Find Expert Lawyers",
            description:
                "Search and connect with verified lawyers across India based on specialization, location, and ratings.",
        },
        {
            icon: <Calendar className="w-8 h-8" />,
            title: "Case Management",
            description:
                "Track court dates, manage case files, and stay updated on your legal proceedings in one place.",
        },
        {
            icon: <CreditCard className="w-8 h-8" />,
            title: "Secure Payments",
            description:
                "Make secure payments to your lawyer with transparent billing and payment tracking.",
        },
        {
            icon: <FileText className="w-8 h-8" />,
            title: "Document Tools",
            description:
                "Summarize legal documents, generate contracts, and manage all your legal paperwork efficiently.",
        },
        {
            icon: <MessageCircle className="w-8 h-8" />,
            title: "Legal AI Assistant",
            description:
                "Get instant answers to legal questions with our AI-powered legal consultation bot.",
        },
        {
            icon: <Users className="w-8 h-8" />,
            title: "Case Collaboration",
            description:
                "Share case details securely with your legal team and stay connected throughout the process.",
        },
    ];

    const testimonials = [
        {
            name: "Priya Sharma",
            role: "Business Owner",
            content:
                "Case Bridge made finding the right lawyer effortless. The platform's case management features kept me organized throughout my legal journey.",
            rating: 5,
        },
        {
            name: "Advocate Rajesh Kumar",
            role: "Legal Professional",
            content:
                "As a lawyer, this platform has streamlined my practice. Client management and payment processing have never been easier.",
            rating: 5,
        },
        {
            name: "Dr. Anita Patel",
            role: "Healthcare Professional",
            content:
                "The legal document summarizer saved me hours of work. The AI assistant provides accurate legal guidance instantly.",
            rating: 5,
        },
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="fixed top-0 w-full bg-gray-900/95 backdrop-blur-md z-50 border-b border-gray-800">
                <nav className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div className="text-2xl font-bold text-white">
                                Case
                                <span className="text-blue-400">Bridge</span>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href="#features"
                                className="text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#how-it-works"
                                className="text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                How It Works
                            </a>
                            <a
                                href="#testimonials"
                                className="text-gray-300 hover:text-blue-400 transition-colors"
                            >
                                Testimonials
                            </a>
                            <Link
                                to="/auth"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                            >
                                Get Started
                            </Link>
                        </div>

                        <button
                            className="md:hidden text-white"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>

                    {isMenuOpen && (
                        <div className="md:hidden mt-4 pb-4 border-t border-gray-800">
                            <div className="flex flex-col space-y-4 pt-4">
                                <a
                                    href="#features"
                                    className="text-gray-300 hover:text-blue-400 transition-colors"
                                >
                                    Features
                                </a>
                                <a
                                    href="#how-it-works"
                                    className="text-gray-300 hover:text-blue-400 transition-colors"
                                >
                                    How It Works
                                </a>
                                <a
                                    href="#testimonials"
                                    className="text-gray-300 hover:text-blue-400 transition-colors"
                                >
                                    Testimonials
                                </a>

                                <Link
                                    to="/auth"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-left"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            <section
                id="hero"
                className="pt-32 pb-20 bg-gray-900 relative overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div
                            className={`transition-all duration-1000 ${
                                isVisible.hero
                                    ? "opacity-100 translate-y-0"
                                    : "opacity-0 translate-y-10"
                            }`}
                        >
                            <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-600/30 rounded-full px-4 py-2 text-sm text-blue-300 mb-6">
                                <Shield className="w-4 h-4" />
                                <span>
                                    Trusted by 50,000+ Legal Professionals
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                                Your Complete{" "}
                                <span className="text-blue-400">
                                    Legal Solution
                                </span>{" "}
                                for Modern India
                            </h1>

                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Connect with expert lawyers, manage cases
                                seamlessly, and access AI-powered legal tools -
                                all in one comprehensive platform designed for
                                India's legal ecosystem.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link
                                    to="/auth"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>Start Your Legal Journey</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </div>

                            <div className="flex items-center space-x-6 text-sm text-gray-400">
                                <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>Free to get started</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>Bank-level security</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                    <span>24/7 support</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    <div className="ml-auto text-xs text-gray-400">
                                        Case Bridge Dashboard
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white">
                                            Legal Dashboard
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-700 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4 text-blue-400" />
                                                <div>
                                                    <div className="text-xs text-gray-400">
                                                        Next Hearing
                                                    </div>
                                                    <div className="text-sm font-semibold">
                                                        Dec 15, 2024
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-gray-700 p-3 rounded-lg">
                                            <div className="flex items-center space-x-2">
                                                <FileText className="w-4 h-4 text-green-400" />
                                                <div>
                                                    <div className="text-xs text-gray-400">
                                                        Active Cases
                                                    </div>
                                                    <div className="text-sm font-semibold">
                                                        12
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-sm font-medium text-gray-300">
                                            Recent Activity
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="text-xs text-gray-300">
                                                        Document uploaded
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        2 hours ago
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="text-xs text-gray-300">
                                                        Payment received
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        5 hours ago
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-4 -right-4 bg-blue-600 p-3 rounded-xl shadow-lg">
                                <MessageCircle className="w-6 h-6" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-green-600 p-3 rounded-xl shadow-lg">
                                <Shield className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="features" className="py-20 bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            Everything You Need
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            From finding the right lawyer to managing your
                            entire legal journey - Case Bridge has you covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gray-900 p-8 rounded-xl border border-gray-700 hover:border-blue-600/50 transition-all duration-300 hover:transform hover:scale-105 group"
                            >
                                <div className="text-blue-400 mb-4 group-hover:text-blue-300 transition-colors">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-white">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-300">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-20 bg-gray-900">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            How It Works
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Get started with Case Bridge in three simple steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center relative">
                            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white">
                                1. Find Your Lawyer
                            </h3>
                            <p className="text-gray-300">
                                Search our verified network of legal
                                professionals based on your specific needs and
                                location.
                            </p>
                            <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-blue-600/30 transform translate-x-8"></div>
                        </div>

                        <div className="text-center relative">
                            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Calendar className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white">
                                2. Manage Your Case
                            </h3>
                            <p className="text-gray-300">
                                Track court dates, share documents, and manage
                                all aspects of your legal case in one place.
                            </p>
                            <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-blue-600/30 transform translate-x-8"></div>
                        </div>

                        <div className="text-center">
                            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3 text-white">
                                3. Stay Protected
                            </h3>
                            <p className="text-gray-300">
                                Use our AI tools for legal guidance and document
                                management throughout your journey.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="testimonials" className="py-20 bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            What Our Users Say
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Join thousands of satisfied users who trust Case
                            Bridge for their legal needs
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="bg-gray-900 p-8 rounded-xl border border-gray-700"
                            >
                                <div className="flex mb-4">
                                    {[...Array(testimonial.rating)].map(
                                        (_, i) => (
                                            <Star
                                                key={i}
                                                className="w-5 h-5 text-yellow-400 fill-current"
                                            />
                                        )
                                    )}
                                </div>
                                <p className="text-gray-300 mb-6 italic">
                                    "{testimonial.content}"
                                </p>
                                <div>
                                    <p className="font-semibold text-white">
                                        {testimonial.name}
                                    </p>
                                    <p className="text-blue-400">
                                        {testimonial.role}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-blue-600">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold mb-2">
                                10,000+
                            </div>
                            <div className="text-blue-100">
                                Verified Lawyers
                            </div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">
                                25,000+
                            </div>
                            <div className="text-blue-100">Cases Managed</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">
                                50,000+
                            </div>
                            <div className="text-blue-100">Happy Clients</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold mb-2">99%</div>
                            <div className="text-blue-100">Success Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-20 bg-gray-900">
                <div className="container mx-auto px-4 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                            Ready to Transform Your Legal Experience?
                        </h2>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join Case Bridge today and experience the future of
                            legal services in India. Your legal journey starts
                            here.
                        </p>
                        <Link
                            to="/auth"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center space-x-2"
                        >
                            <span>Get Started Now</span>
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-800 text-white py-16 border-t border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center space-x-2 mb-4">
                                <span className="text-xl font-bold">
                                    Case Bridge
                                </span>
                            </div>
                            <p className="text-gray-400">
                                Your complete legal solution for modern India.
                                Connecting justice with technology.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Services</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Find Lawyers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Case Management
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Legal AI
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Document Tools
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Legal
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Careers
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#"
                                        className="hover:text-white transition-colors"
                                    >
                                        Press
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 mt-12 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 Case Bridge. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
