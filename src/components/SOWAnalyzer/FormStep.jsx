// File: components/SOWAnalyzer/FormStep.jsx
import React, { useState } from "react";
import { X, Calendar, Users, AlertCircle } from "lucide-react";

const FormStep = ({
  formData,
  setFormData,
  loading,
  error,
  onSubmit,
  onCancel,
}) => {
  const [newTech, setNewTech] = useState("");
  const [localError, setLocalError] = useState(null);

  const update = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setLocalError(null); // Clear error on change
  };

  const handleTechRemove = (index) => {
    const techs = [...(formData.technology || [])];
    techs.splice(index, 1);
    update("technology", techs);
  };

  const addTechnology = () => {
    if (!newTech.trim()) return;
    if ((formData.technology || []).includes(newTech.trim())) return;

    const updated = [...(formData.technology || []), newTech.trim()];
    update("technology", updated);
    setNewTech("");
  };

  const handleFormSubmit = () => {
    const requiredFields = [
      "name",
      "manager",
      "client",
      "partner",
      "status",
      "practice",
      "category",
      "billingType",
      "budgetedHours",
      "startDate",
      "endDate",
      "keepResourcesAvailable",
    ];

    for (let field of requiredFields) {
      if (
        formData[field] === undefined ||
        formData[field] === null ||
        formData[field] === ""
      ) {
        setLocalError(`Please fill out the "${field}" field.`);
        return;
      }
    }

    if (!formData.technology || formData.technology.length === 0) {
      setLocalError("Please add at least one technology.");
      return;
    }

    setLocalError(null); // Clear any previous error
    onSubmit(); // Proceed
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Add New Project
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Text Inputs */}
          {[
            { label: "Name", field: "name", placeholder: "Some Project" },
            { label: "Manager", field: "manager", placeholder: "Manager Name" },
            { label: "Client", field: "client", placeholder: "Client Name" },
            { label: "Partner", field: "partner", placeholder: "Partner Name" },
            { label: "Status", field: "status", placeholder: "Status" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData[field] || ""}
                  onChange={(e) => update(field, e.target.value)}
                  placeholder={placeholder}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData[field] && (
                  <button
                    onClick={() => update(field, "")}
                    className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Dropdowns */}
          <Dropdown
            label="Practice"
            field="practice"
            value={formData.practice}
            onChange={update}
            required
            options={[
              "Artificial Intelligence",
              "Cloud Engineering",
              "Collaboration",
              "Custom Dev",
              "Dynamics 365",
              "Data Estate and DBA",
              "Human Resource",
              "IT Internal",
              "Modern Workplace",
              "Business Intelligence",
              "UI/UX",
              "Recruitment",
              "Quality Assurance",
              "Security",
              "KPO",
              "Project Management",
              "PMO",
              "Finance",
              "Administration",
              "Network Engg",
              "Business Analysis",
              "Sales & Marketing",
              "Document Management",
              "Resource Management",
              "Learning Management System",
              "Atidan Founders",
            ]}
          />

          <Dropdown
            label="Category"
            field="category"
            value={formData.category}
            onChange={update}
            required
            options={[
              "Project",
              "Pursuit",
              "Support",
              "Support Engagement",
              "Training",
            ]}
          />

          <Dropdown
            label="Billing Type"
            field="billingType"
            value={formData.billingType}
            onChange={update}
            required
            options={[
              "Retainer",
              "Fixed Price",
              "Time & Material",
              "Staff Augumentation",
              "Non-Billable",
            ]}
          />

          {/* Budgeted Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budgeted Hours <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.budgetedHours || ""}
              onChange={(e) => update("budgetedHours", e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>

          {/* Technology Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technology <span className="text-red-500">*</span>
            </label>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a technology..."
              />
              <button
                type="button"
                onClick={addTechnology}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            <div className="border border-gray-300 rounded-md p-2 min-h-[40px]">
              <div className="flex flex-wrap gap-2">
                {(formData.technology || []).map((tech, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
                  >
                    {tech}
                    <button
                      onClick={() => handleTechRemove(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Start Date & End Date */}
          {["startDate", "endDate"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === "startDate" ? "Start Date" : "End Date"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData[field] || ""}
                  onChange={(e) => update(field, e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Calendar className="absolute right-3 top-2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Keep Resources Available */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Keep Resources Available for Other Projects{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="flex space-x-4">
            {["Yes", "No"].map((label) => (
              <label key={label} className="flex items-center">
                <input
                  type="radio"
                  name="keepResources"
                  checked={
                    formData.keepResourcesAvailable === (label === "Yes")
                  }
                  onChange={() =>
                    update("keepResourcesAvailable", label === "Yes")
                  }
                  className="mr-2"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* Error Section */}
        {(error || localError) && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error || localError}</span>
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
            onClick={onCancel}
            className="border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Dropdown = ({ label, field, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value || ""}
      onChange={(e) => onChange(field, e.target.value)}
      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      <option value="">Select {label}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </div>
);

export default FormStep;
