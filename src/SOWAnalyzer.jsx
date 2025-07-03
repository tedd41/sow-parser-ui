import React, { useState } from "react";
import {
  Upload,
  X,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

const SOWAnalyzer = () => {
  const [currentStep, setCurrentStep] = useState("upload"); // 'upload', 'form', 'recommendations'
  const [file, setFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [formData, setFormData] = useState({});
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to convert MM/DD/YYYY to YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Handle MM/DD/YYYY format
    const mmddyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    // Handle YYYY-MM-DD format (already correct)
    const yyyymmdd = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (yyyymmdd) {
      return dateString;
    }

    // If format is unrecognized, return empty string
    return "";
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please upload a PDF file");
    }
  };

  // Extract SOW data
  const extractSOWData = async () => {
    if (!file) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://127.0.0.1:5000/extract_sow", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to extract SOW data");

      const data = await response.json();
      setExtractedData(data);

      // Clean and format the extracted data
      const cleanString = (str) => {
        if (!str) return "";
        return str.replace(/^(Client:|Manager:|Partner:)\s*/i, "").trim();
      };

      const cleanManager = (manager) => {
        if (!manager) return "";
        return manager
          .replace(/based on the rules given:\s*Manager:\s*/i, "")
          .trim();
      };

      const cleanBudgetedHours = (hours) => {
        if (!hours) return "";
        return hours
          .toString()
          .replace(/\s*Budgeted Hours\s*/i, "")
          .trim();
      };

      setFormData({
        name: data["Project Name"] || "",
        practice: data["Practice"] || "",
        technology: Array.isArray(data["Technology"]) ? data["Technology"] : [],
        category: data["Category"] || "",
        manager: cleanManager(data["Manager"]) || "",
        client: cleanString(data["Client"]) || "",
        partner: data["Partner"] || "",
        billingType: data["Billing Type"] || "",
        status: data["Status"] || "",
        budgetedHours: cleanBudgetedHours(data["Budgeted Hours"]) || "",
        startDate: formatDateForInput(data["Start date"]) || "",
        endDate: formatDateForInput(data["End Date"]) || "",
        keepResourcesAvailable: false,
      });
      setCurrentStep("form");
    } catch (err) {
      setError("Error extracting SOW data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/recommend_employees_clean",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) throw new Error("Failed to get recommendations");

      const data = await response.json();
      setRecommendations(data);
      setCurrentStep("recommendations");
    } catch (err) {
      setError("Error getting recommendations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset to start
  const resetFlow = () => {
    setCurrentStep("upload");
    setFile(null);
    setExtractedData(null);
    setFormData({});
    setRecommendations(null);
    setError("");
  };

  // Render upload step
  const renderUploadStep = () => (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SOW Analyzer</h1>
        <p className="text-gray-600">
          Upload your Statement of Work PDF to get employee recommendations
        </p>
      </div>

      <label
        htmlFor="file-upload"
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer block"
      >
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="space-y-2">
          <span className="text-lg font-medium text-gray-900">
            Upload SOW PDF
          </span>
          <p className="text-gray-500">or drag and drop your PDF file here</p>
        </div>
        <input
          id="file-upload"
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {file && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{file.name}</span>
          </div>
          <button
            onClick={() => setFile(null)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={extractSOWData}
          disabled={!file || loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Analyze SOW"}
        </button>
      </div>
    </div>
  );

  // Render form step
  const renderFormStep = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Add New Project
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Some Project"
              />
              {formData.name && (
                <button
                  onClick={() => setFormData({ ...formData, name: "" })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Practice */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Practice
            </label>
            <select
              value={formData.practice || ""}
              onChange={(e) =>
                setFormData({ ...formData, practice: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Practice</option>
              <option value="Artificial Intelligence">
                Artificial Intelligence
              </option>
              <option value="Cloud Engineering">Cloud Engineering</option>
              <option value="Collaboration">Collaboration</option>
              <option value="Custom Dev">Custom Dev</option>
              <option value="Dynamics 365">Dynamics 365</option>
              <option value="Data Estate and DBA">Data Estate and DBA</option>
              <option value="Human Resource">Human Resource</option>
              <option value="IT Internal">IT Internal</option>
              <option value="Modern Workplace">Modern Workplace</option>
              <option value="Business Intelligence">
                Business Intelligence
              </option>
              <option value="UI/UX">UI/UX</option>
              <option value="Recruitment">Recruitment</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="Security">Security</option>
              <option value="KPO">KPO</option>
              <option value="Project Management">Project Management</option>
              <option value="PMO">PMO</option>
              <option value="Finance">Finance</option>
              <option value="Administration">Administration</option>
              <option value="Network Engg">Network Engg</option>
              <option value="Business Analysis">Business Analysis</option>
              <option value="Sales & Marketing">Sales & Marketing</option>
              <option value="Document Management">Document Management</option>
              <option value="Resource Management">Resource Management</option>
              <option value="Learning Management System">
                Learning Management System
              </option>
              <option value="Atidan Founders">Atidan Founders</option>
            </select>
          </div>

          {/* Technology */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technology <span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-md p-2 min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500">
              <div className="flex flex-wrap gap-2">
                {(formData.technology || []).map((tech, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
                  >
                    {tech}
                    <button
                      onClick={() => {
                        const newTech = [...(formData.technology || [])];
                        newTech.splice(index, 1);
                        setFormData({ ...formData, technology: newTech });
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category || ""}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-Select-</option>
              <option value="Project">Project</option>
              <option value="Pursuit">Pursuit</option>
              <option value="Support">Support</option>
              <option value="Support Engagement">Support Engagement</option>
              <option value="Training">Training</option>
            </select>
          </div>

          {/* Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.manager || ""}
                onChange={(e) =>
                  setFormData({ ...formData, manager: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Manager Name"
              />
              {formData.manager && (
                <button
                  onClick={() => setFormData({ ...formData, manager: "" })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Client */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.client || ""}
                onChange={(e) =>
                  setFormData({ ...formData, client: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Client Name"
              />
              {formData.client && (
                <button
                  onClick={() => setFormData({ ...formData, client: "" })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Partner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.partner || ""}
                onChange={(e) =>
                  setFormData({ ...formData, partner: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Partner Name"
              />
              {formData.partner && (
                <button
                  onClick={() => setFormData({ ...formData, partner: "" })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Billing Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Billing Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.billingType || ""}
              onChange={(e) =>
                setFormData({ ...formData, billingType: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Billing Type</option>
              <option value="Retainer">Retainer</option>
              <option value="Fixed Price">Fixed Price</option>
              <option value="Time & Material">Time & Material</option>
              <option value="Staff Augumentation">Staff Augumentation</option>
              <option value="Non-Billable">Non Billable</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.status || ""}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Status"
              />
              {formData.status && (
                <button
                  onClick={() => setFormData({ ...formData, status: "" })}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Budgeted Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budgeted Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.budgetedHours || ""}
              onChange={(e) =>
                setFormData({ ...formData, budgetedHours: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.endDate || ""}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Keep Resources Available */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keep Resources Available for Other Projects{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="keepResources"
                checked={formData.keepResourcesAvailable === true}
                onChange={() =>
                  setFormData({ ...formData, keepResourcesAvailable: true })
                }
                className="mr-2"
              />
              Yes
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="keepResources"
                checked={formData.keepResourcesAvailable === false}
                onChange={() =>
                  setFormData({ ...formData, keepResourcesAvailable: false })
                }
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={handleFormSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>
              {loading ? "Getting Recommendations..." : "Get Recommendations"}
            </span>
          </button>
          <button
            onClick={resetFlow}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Render recommendations step
  const renderRecommendationsStep = () => (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Employee Recommendations
        </h2>
        <p className="text-gray-600">
          Found {recommendations?.recommendations?.length || 0} recommended
          employees from{" "}
          {recommendations?.summary?.initial_shortlisted_candidates || 0}{" "}
          initially shortlisted candidates
        </p>
      </div>

      <div className="grid gap-6">
        {recommendations?.recommendations?.map((employee, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {employee.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Rank #{employee.rank}</span>
                    <span>
                      Match Score: {(employee.match_score * 100).toFixed(0)}%
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.recommendation_level === "Highly Recommended"
                          ? "bg-green-100 text-green-800"
                          : employee.recommendation_level === "Recommended"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {employee.recommendation_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Key Strengths
                </h4>
                <ul className="space-y-1">
                  {employee.key_strengths?.map((strength, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Concerns</h4>
                <ul className="space-y-1">
                  {employee.concerns?.map((concern, idx) => (
                    <li
                      key={idx}
                      className="text-sm text-gray-700 flex items-start"
                    >
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                      {concern}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={resetFlow}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Analyze Another SOW
        </button>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep === "upload" && renderUploadStep()}
      {currentStep === "form" && renderFormStep()}
      {currentStep === "recommendations" && renderRecommendationsStep()}
    </div>
  );
};

export default SOWAnalyzer;
