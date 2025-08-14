import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import toast from "react-hot-toast";
import axiosInstance from "../../services/axiosInstance";

const isDev = import.meta.env.VITE_DEV;

const Cases = ({ cases }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedCases, setExpandedCases] = useState(new Set());

    const handleDocumentDownload = (documentUrl, title) => {
        const link = document.createElement("a");
        link.href = documentUrl;
        link.download = title || "document";
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
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
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() =>
                                    window.open(doc.document, "_blank")
                                }
                                className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
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
                                className="p-1 text-gray-400 hover:text-green-400 transition-colors"
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-semibold text-white">
                    My Cases
                </h2>
            </div>
            <div className="grid gap-4">
                {cases.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
                            <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                            <h4 className="text-lg font-semibold text-white mb-2">
                                No cases created
                            </h4>

                            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 mt-4">
                                <div className="flex items-center justify-center space-x-2 text-blue-400">
                                    <Users className="w-5 h-5" />
                                    <span className="text-sm">
                                        Hire lawyers to view cases.
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    cases.map((case_) => (
                        <div
                            key={case_.id}
                            className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white mb-1">
                                            {case_.title}
                                        </h4>
                                        <p className="text-sm text-gray-400">
                                            Case No: {case_.case_number}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className={`px-3 py-1 rounded-full text-xs ${
                                                case_.status === "active"
                                                    ? "bg-green-600/20 text-green-400"
                                                    : case_.status === "pending"
                                                    ? "bg-yellow-600/20 text-yellow-400"
                                                    : "bg-gray-600/20 text-gray-400"
                                            }`}
                                        >
                                            {case_.status}
                                        </div>
                                        <div
                                            className={`px-2 py-1 rounded-full text-xs ${
                                                case_.priority === "urgent"
                                                    ? "bg-red-600/20 text-red-400"
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

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Client
                                        </p>
                                        <p className="text-sm text-gray-300">
                                            {case_.client}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Court
                                        </p>
                                        <p className="text-sm text-gray-300">
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
                                            <div className="flex items-center justify-between mb-3">
                                                <h5 className="text-sm font-medium text-white">
                                                    Case Documents
                                                </h5>
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
        </div>
    );
};

export default Cases;
