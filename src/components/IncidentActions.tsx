import React, { useState } from 'react';

// Define a type for the tab IDs for type safety
type ActionTab = 'register' | 'assign' | 'close';

/**
 * A shared, styled input field for the forms
 */
const FormInput = ({ label, id, ...props }: { label: string; id: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            {...props}
        />
    </div>
);

/**
 * A shared, styled text area for the forms
 */
const FormTextarea = ({ label, id, ...props }: { label: string; id: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            id={id}
            rows={3}
            className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            {...props}
        />
    </div>
);

/**
 * A shared, styled submit button
 */
const SubmitButton = ({ children }: { children: React.ReactNode }) => (
    <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
        {children}
    </button>
);

interface ReusableFormProps {
    fields: FormField[];
    onSubmit: (formData: Record<string, string>) => void;
    submitLabel: string;
}

/**
 * A reusable form component that renders fields based on a config object.
 */
const ReusableForm: React.FC<ReusableFormProps> = ({ fields, onSubmit, submitLabel }) => {
    // State to hold all form data
    const [formData, setFormData] = useState<Record<string, string>>(
        // Initialize state with empty strings for each field ID
        fields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {})
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Add form validation logic here before submitting
        onSubmit(formData);
        // Optional: Clear form after submission
        setFormData(fields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {}));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(field => {
                const commonProps = {
                    id: field.id,
                    label: field.label,
                    placeholder: field.placeholder,
                    value: formData[field.id],
                    onChange: handleChange,
                    required: true, // Example: make all fields required
                };
                
                if (field.type === 'textarea') {
                return <FormTextarea key={field.id} {...commonProps} />;
                }

                return <FormInput key={field.id} {...commonProps} />;
            })}
            <SubmitButton>{submitLabel}</SubmitButton>
        </form>
    );
};

type FormField = {
    id: string;
    label: string;
    placeholder: string;
    type: 'input' | 'textarea';
};

// Define the fields for the "Register" form
const registerFields: FormField[] = [
    { id: 'register-summary', label: 'Mô Tả Sự Cố (Summary)', placeholder: 'Mô tả chi tiết sự cố...', type: 'textarea' },
    { id: 'register-reporter', label: 'Người Báo (Reporter)', placeholder: 'Tên người báo cáo...', type: 'input' },
    { id: 'register-machine', label: 'Loại Máy (Machine Type)', placeholder: 'Vd: Máy Dập, Máy Cắt...', type: 'input' },
];

// Define the fields for the "Assign" form
const assignFields: FormField[] = [
    { id: 'assign-id', label: 'ID Sự Cố', placeholder: 'Nhập ID sự cố để gán...', type: 'input' },
    { id: 'assign-user', label: 'Gán Cho (Assign To)', placeholder: 'Tên người hoặc bộ phận xử lý...', type: 'input' },
];

// Define the fields for the "Close" form
const closeFields: FormField[] = [
    { id: 'close-id', label: 'ID Sự Cố', placeholder: 'Nhập ID sự cố để đóng...', type: 'input' },
    { id: 'close-notes', label: 'Ghi Chú Đóng (Closing Notes)', placeholder: 'Mô tả cách thức xử lý, lý do đóng...', type: 'textarea' },
];

/**
 * Main component to render the tabs and forms
 */

export const IncidentActions: React.FC = () => {
// ... existing useState and handleTabClick ...
// This state tracks which tab is currently open, or null if all are closed
    const [activeTab, setActiveTab] = useState<ActionTab | null>(null);

    // This logic handles the expand/condense toggle behavior
    const handleTabClick = (tabName: ActionTab) => {
        if (activeTab === tabName) {
            // If the clicked tab is already open, close it
            setActiveTab(null);
        } else {
            // Otherwise, open the clicked tab
            setActiveTab(tabName);
        }
    };

    // +++ ADD NEW SUBMIT HANDLERS +++
    const handleRegisterSubmit = (formData: Record<string, string>) => {
        // TODO: Form validation and API call
        console.log("Submitting new incident:", formData);
        // Close the tab after submission
        setActiveTab(null);
    };

    const handleAssignSubmit = (formData: Record<string, string>) => {
        // TODO: Form validation and API call
        console.log("Assigning incident:", formData);
        // Close the tab after submission
        setActiveTab(null);
    };

    const handleCloseSubmit = (formData: Record<string, string>) => {
        // TODO: Form validation and API call
        console.log("Closing incident:", formData);
        // Close the tab after submission
        setActiveTab(null);
    };


    // Renders the correct form based on the active tab
    const renderActiveForm = () => {
        switch (activeTab) {
            case 'register':
                // --- MODIFY RENDER ---
                return <ReusableForm 
                    fields={registerFields} 
                    onSubmit={handleRegisterSubmit} 
                    submitLabel="Đăng Ký Sự Cố" 
                />;
            case 'assign':
                // --- MODIFY RENDER ---
                return <ReusableForm 
                    fields={assignFields} 
                    onSubmit={handleAssignSubmit} 
                    submitLabel="Gán Trách Nhiệm" 
                />;
            case 'close':
                // --- MODIFY RENDER ---
                return <ReusableForm 
                    fields={closeFields} 
                    onSubmit={handleCloseSubmit} 
                    submitLabel="Đóng Sự Cố" 
                />;
            default:
                return null; // No tab is active, render nothing
        }
    };

// Helper to get conditional classes for active/inactive tabs
    const getTabClassName = (tabName: ActionTab) => {
        const isActive = activeTab === tabName;
        return `
            px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-indigo-400
            ${isActive
                ? 'bg-indigo-600 text-white shadow-md' // Active tab
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300' // Inactive tab
            }
        `;
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-4">
            {/* 1. The Tab Buttons */}
            <div className="flex space-x-1">
                <button
                    onClick={() => handleTabClick('register')}
                    className={getTabClassName('register')}
                >
                    Đăng Ký Sự Cố
                </button>
                <button
                    onClick={() => handleTabClick('assign')}
                    className={getTabClassName('assign')}
                >
                    Gán Sự Cố
                </button>
                <button
                    onClick={() => handleTabClick('close')}
                    className={getTabClassName('close')}
                >
                    Đóng Sự Cố
                </button>
            </div>

            {/* 2. The Form Container */}
            {/* This container only renders if a tab is active, creating the expand/collapse effect */}
            {activeTab && (
                <div className="bg-white p-4 rounded-b-lg rounded-r-lg shadow-lg border border-gray-200">
                    {renderActiveForm()}
                </div>
            )}
        </div>
    );
};