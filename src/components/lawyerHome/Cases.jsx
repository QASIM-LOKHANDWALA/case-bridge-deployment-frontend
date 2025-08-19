import React, { useState } from "react";
import {
    Plus,
    X,
    Calendar,
    User,
    Building,
    Hash,
    FileText,
    AlertCircle,
    File,
    Download,
    Eye,
    ChevronDown,
    ChevronUp,
    Upload,
    Paperclip,
    Briefcase,
    Users,
    Search,
    Edit3,
    Save,
    Filter,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import axiosInstance from "../../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const Cases = ({ cases, onCaseAdded, fetchCases, clients }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingCase, setEditingCase] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [editError, setEditError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedCases, setExpandedCases] = useState(new Set());
    const [uploadingFiles, setUploadingFiles] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        client_id: "",
        court: "",
        case_number: "",
        next_hearing: "",
        status: "active",
        priority: "medium",
    });
    const [editFormData, setEditFormData] = useState({
        status: "",
        next_hearing: "",
        priority: "",
    });
    const { token } = useAuth();

    const toggleCaseExpansion = (caseId) => {
        setExpandedCases((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(caseId)) {
                newSet.delete(caseId);
            } else {
                newSet.add(caseId);
            }
            return newSet;
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditCase = (case_) => {
        setEditingCase(case_);
        setEditFormData({
            status: case_.status,
            next_hearing: case_.next_hearing,
            priority: case_.priority,
        });
        setIsEditModalOpen(true);
        setEditError(null);
    };

    const handleUpdateCase = async () => {
        if (!editingCase) return;

        setIsUpdating(true);
        setEditError(null);

        const hasChanges =
            editFormData.status !== editingCase.status ||
            editFormData.next_hearing !== editingCase.next_hearing ||
            editFormData.priority !== editingCase.priority;

        if (!hasChanges) {
            setEditError("No changes detected");
            setIsUpdating(false);
            return;
        }

        try {
            const response = await axiosInstance.patch(
                `/api/lawyers/update-case/${editingCase.id}/`,
                editFormData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                setIsEditModalOpen(false);
                setEditingCase(null);
                fetchCases();
                toast.success("Case updated successfully!");
            } else {
                setEditError(response.data.error || "Failed to update case");
            }
        } catch (err) {
            const errorMessage =
                err.response?.data?.error || "Network error. Please try again.";
            setEditError(errorMessage);
            if (isDev) console.error("Error updating case:", err);
        } finally {
            setIsUpdating(false);
        }
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingCase(null);
        setEditError(null);
        setEditFormData({
            status: "",
            next_hearing: "",
            priority: "",
        });
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);

        const requiredFields = [
            "title",
            "client_id",
            "court",
            "case_number",
            "next_hearing",
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
                "/api/lawyers/cases/",
                formData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Token ${token}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                setIsModalOpen(false);
                setFormData({
                    title: "",
                    client_id: "",
                    court: "",
                    case_number: "",
                    next_hearing: "",
                    status: "active",
                    priority: "medium",
                });

                onCaseAdded(response.data.case);
            } else {
                setError(response.data.error || "Failed to create case");
            }
        } catch (err) {
            setError("Network error. Please try again.");
            if (isDev) console.error("Error creating case:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDocumentUpload = async (caseId, file) => {
        if (!file) return;

        setUploadingFiles((prev) => new Set(prev).add(caseId));

        const formData = new FormData();
        formData.append("document", file);
        formData.append("title", file.name);

        try {
            const response = await axiosInstance.post(
                `/api/lawyers/cases/${caseId}/upload-document/`,
                formData,
                {
                    headers: {
                        Authorization: `Token ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response.status === 201) {
                fetchCases();
                toast.success("Document added!");
            }
        } catch (error) {
            if (isDev) console.error("Upload failed:", error);
            toast.error("Failed to add document.");
        } finally {
            setUploadingFiles((prev) => {
                const newSet = new Set(prev);
                newSet.delete(caseId);
                return newSet;
            });
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
        setFormData({
            title: "",
            client_id: "",
            court: "",
            case_number: "",
            next_hearing: "",
            status: "active",
            priority: "medium",
        });
    };

    const handleDocumentDownload = (documentUrl, title) => {
        const link = document.createElement("a");
        link.href = documentUrl;
        link.download = title || "document";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFileIcon = (fileName) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "pdf":
                return <File className="w-4 h-4 text-red-400" />;
            case "doc":
            case "docx":
                return <FileText className="w-4 h-4 text-blue-400" />;
            case "xls":
            case "xlsx":
                return <File className="w-4 h-4 text-green-400" />;
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return <File className="w-4 h-4 text-purple-400" />;
            default:
                return <File className="w-4 h-4 text-gray-400" />;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const DocumentsList = ({ documents, caseId }) => {
        const MAX_VISIBLE_DOCS = 3;
        const [showAll, setShowAll] = useState(false);

        if (!documents || documents.length === 0) {
            return (
                <div className="text-center py-4 text-gray-500 text-sm">
                    No documents uploaded yet
                </div>
            );
        }

        const visibleDocuments = showAll
            ? documents
            : documents.slice(0, MAX_VISIBLE_DOCS);
        const remainingCount = documents.length - MAX_VISIBLE_DOCS;

        return (
            <div className="space-y-2">
                {visibleDocuments.map((doc) => (
                    <div
                        key={doc.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors gap-3 sm:gap-0"
                    >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {getFileIcon(doc.document)}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {doc.title}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Uploaded: {formatDate(doc.uploaded_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-end space-x-2">
                            <button
                                onClick={() =>
                                    window.open(doc.document, "_blank")
                                }
                                className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                                title="View document"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() =>
                                    handleDocumentDownload(
                                        doc.document,
                                        doc.title
                                    )
                                }
                                className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                                title="Download document"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {remainingCount > 0 && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="w-full py-2 text-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp className="w-4 h-4 inline mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4 inline mr-1" />
                                Show {remainingCount} more document
                                {remainingCount > 1 ? "s" : ""}
                            </>
                        )}
                    </button>
                )}
            </div>
        );
    };

    const filteredCases = cases.filter((c) => {
        const matchesSearch = c.client
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">My Cases</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-center space-x-2 w-full sm:w-auto"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Case</span>
                </button>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by client name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden flex items-center justify-center px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </button>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="hidden sm:block px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                {showFilters && (
                    <div className="sm:hidden">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {filteredCases.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 sm:p-8">
                            <Briefcase className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-gray-600" />
                            <h4 className="text-lg font-semibold text-white mb-2">
                                No cases created
                            </h4>
                            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mt-4">
                                <div className="flex items-center justify-center space-x-2 text-blue-400">
                                    <Users className="w-5 h-5" />
                                    <span className="text-sm text-center">
                                        Connect with clients to get started
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    filteredCases.map((case_) => (
                        <div
                            key={case_.id}
                            className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-white mb-1 truncate">
                                            {case_.title}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            Case No: {case_.case_number}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                                        <button
                                            onClick={() =>
                                                handleEditCase(case_)
                                            }
                                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                                            title="Edit case"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                                                    case_.status === "active"
                                                        ? "bg-green-600/20 text-green-400"
                                                        : case_.status ===
                                                          "pending"
                                                        ? "bg-yellow-600/20 text-yellow-400"
                                                        : "bg-gray-600/20 text-gray-400"
                                                }`}
                                            >
                                                {case_.status.replace("_", " ")}
                                            </div>
                                            <div
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    case_.priority === "urgent"
                                                        ? "bg-red-600/20 text-red-400"
                                                        : case_.priority ===
                                                          "high"
                                                        ? "bg-orange-600/20 text-orange-400"
                                                        : case_.priority ===
                                                          "medium"
                                                        ? "bg-yellow-600/20 text-yellow-400"
                                                        : "bg-green-600/20 text-green-400"
                                                }`}
                                            >
                                                {case_.priority}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Client
                                        </p>
                                        <p className="text-sm text-gray-300 truncate">
                                            {case_.client}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Court
                                        </p>
                                        <p className="text-sm text-gray-300 truncate">
                                            {case_.court}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Next Hearing
                                        </p>
                                        <p className="text-sm text-blue-400">
                                            {case_.next_hearing}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Documents
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Paperclip className="w-4 h-4 text-gray-400" />
                                            <p className="text-sm text-gray-300">
                                                {case_.documents?.length || 0}{" "}
                                                file
                                                {case_.documents?.length !== 1
                                                    ? "s"
                                                    : ""}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-700 pt-4">
                                    <button
                                        onClick={() =>
                                            toggleCaseExpansion(case_.id)
                                        }
                                        className="flex items-center justify-between w-full text-left mb-3 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <FileText className="w-4 h-4" />
                                            <span>
                                                Documents (
                                                {case_.documents?.length || 0})
                                            </span>
                                        </div>
                                        {expandedCases.has(case_.id) ? (
                                            <ChevronUp className="w-4 h-4" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4" />
                                        )}
                                    </button>

                                    {expandedCases.has(case_.id) && (
                                        <div className="bg-gray-900 rounded-lg p-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-3">
                                                <h5 className="text-sm font-medium text-white">
                                                    Case Documents
                                                </h5>
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        id={`file-upload-${case_.id}`}
                                                        className="hidden"
                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                                                        onChange={(e) => {
                                                            const file =
                                                                e.target
                                                                    .files[0];
                                                            if (file) {
                                                                handleDocumentUpload(
                                                                    case_.id,
                                                                    file
                                                                );
                                                                e.target.value =
                                                                    "";
                                                            }
                                                        }}
                                                    />
                                                    <label
                                                        htmlFor={`file-upload-${case_.id}`}
                                                        className={`text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center sm:justify-start space-x-1 cursor-pointer ${
                                                            uploadingFiles.has(
                                                                case_.id
                                                            )
                                                                ? "opacity-50 cursor-not-allowed"
                                                                : ""
                                                        }`}
                                                    >
                                                        {uploadingFiles.has(
                                                            case_.id
                                                        ) ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                                                                <span>
                                                                    Uploading...
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-4 h-4" />
                                                                <span>
                                                                    Upload New
                                                                </span>
                                                            </>
                                                        )}
                                                    </label>
                                                </div>
                                            </div>
                                            <DocumentsList
                                                documents={case_.documents}
                                                caseId={case_.id}
                                            />
                                        </div>
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
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
                            <h2 className="text-lg sm:text-xl font-semibold text-white">
                                Add New Case
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            {error && (
                                <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3 flex items-start space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-red-400 text-sm">
                                        {error}
                                    </span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <FileText className="w-4 h-4 inline mr-1" />
                                        Case Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter case title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <User className="w-4 h-4 inline mr-1" />
                                        Client *
                                    </label>
                                    <select
                                        name="client_id"
                                        value={formData.client_id}
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
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Building className="w-4 h-4 inline mr-1" />
                                        Court *
                                    </label>
                                    <input
                                        type="text"
                                        name="court"
                                        value={formData.court}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter court name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        <Hash className="w-4 h-4 inline mr-1" />
                                        Case Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="case_number"
                                        value={formData.case_number}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter case number"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Next Hearing *
                                </label>
                                <input
                                    type="date"
                                    name="next_hearing"
                                    value={formData.next_hearing}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 order-1 sm:order-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Creating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4" />
                                            <span>Create Case</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-lg">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
                            <h2 className="text-lg sm:text-xl font-semibold text-white">
                                Edit Case
                            </h2>
                            <button
                                onClick={closeEditModal}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 space-y-4">
                            {editError && (
                                <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-3 flex items-start space-x-2">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <span className="text-red-400 text-sm">
                                        {editError}
                                    </span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={editFormData.status}
                                        onChange={handleEditInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    >
                                        <option value="active">Active</option>
                                        <option value="pending">Pending</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Next Hearing
                                    </label>
                                    <input
                                        type="date"
                                        name="next_hearing"
                                        value={editFormData.next_hearing}
                                        onChange={handleEditInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        name="priority"
                                        value={editFormData.priority}
                                        onChange={handleEditInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors order-2 sm:order-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleUpdateCase}
                                    disabled={isUpdating}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 order-1 sm:order-2"
                                >
                                    {isUpdating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Updating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Update Case</span>
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

export default Cases;
