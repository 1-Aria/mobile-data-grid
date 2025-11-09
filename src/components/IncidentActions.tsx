import React, { useState } from 'react';

// Define a type for the tab IDs for type safety
type ActionTab = 'register' | 'assign' | 'close';

/**
 * A shared, styled input field for the forms
 */
// Added validationMessage prop to FormInput/FormTextarea
const FormInput = ({ label, id, validationMessage, ...props }: { label: string; id: string; validationMessage?: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            {...props}
        />
        {/* Validation Feedback */}
        {validationMessage && (
            <p className={`mt-1 text-xs ${validationMessage.startsWith('Valid') ? 'text-green-600' : 'text-red-600'}`}>
                {validationMessage}
            </p>
        )}
    </div>
);

/**
 * A shared, styled text area for the forms
 */
const FormTextarea = ({ label, id, validationMessage, ...props }: { label: string; id: string; validationMessage?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea
            id={id}
            rows={3}
            className="p-2 w-full border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            {...props}
        />
        {/* Validation Feedback */}
        {validationMessage && (
            <p className={`mt-1 text-xs ${validationMessage.startsWith('Valid') ? 'text-green-600' : 'text-red-600'}`}>
                {validationMessage}
            </p>
        )}
    </div>
);

/**
 * A shared, styled submit button (Now disabled if any errors are present)
 */
const SubmitButton = ({ children, disabled }: { children: React.ReactNode, disabled: boolean }) => (
    <button
        type="submit"
        disabled={disabled}
        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 
            ${disabled 
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500'
            }
        `}
    >
        {children}
    </button>
);

interface ReusableFormProps {
    fields: FormField[];
    onSubmit: (formData: Record<string, string>) => void;
    submitLabel: string;
    // New validation props
    onFieldChange: (id: string, value: string) => void;
    validationStatus: Record<string, { message: string, isValid: boolean }>;
}

/**
 * A reusable form component that renders fields based on a config object.
 */
const ReusableForm: React.FC<ReusableFormProps> = ({ fields, onSubmit, submitLabel, onFieldChange, validationStatus }) => {
    // State to hold all form data
    const [formData, setFormData] = useState<Record<string, string>>(
        // Initialize state with empty strings for each field ID
        fields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {})
    );

    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
        onFieldChange(id, value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setHasAttemptedSubmit(true);

        // Check for any invalid fields in the current form's fields
        const isFormValid = fields.every(field => validationStatus[field.id]?.isValid === true);

        if (!isFormValid) {
            console.error("Submission blocked: Form contains invalid fields.");
            // Optionally set a general error message here
            return;
        }

        onSubmit(formData);
        // Clear form after successful submission
        setFormData(fields.reduce((acc, field) => ({ ...acc, [field.id]: '' }), {}));
        setHasAttemptedSubmit(false);
    };
    
    // Determine if the submit button should be disabled
    const hasError = fields.some(field => validationStatus[field.id]?.isValid === false);


    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(field => {
                const status = validationStatus[field.id];

                const commonProps = {
                    id: field.id,
                    label: field.label,
                    placeholder: field.placeholder,
                    value: formData[field.id],
                    onChange: handleChange,
                    required: true, 
                    // Pass the message for display
                    validationMessage: status ? status.message : undefined
                };
                
                if (field.type === 'textarea') {
                    return <FormTextarea key={field.id} {...commonProps} />;
                }
                
                return <FormInput key={field.id} {...commonProps} />;
            })}
            {/* Submit button is disabled if there are any errors */}
            <SubmitButton disabled={hasError && hasAttemptedSubmit}>{submitLabel}</SubmitButton>
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
    { id: 'register-machine', label: 'Mã Máy (Machine ID)', placeholder: 'Vd: MCH-001', type: 'input' }, // Changed label to reflect ID input
];

// Define the fields for the "Assign" form
const assignFields: FormField[] = [
    { id: 'assign-id', label: 'ID Sự Cố', placeholder: 'Nhập ID sự cố để gán...', type: 'input' },
    { id: 'assign-user', label: 'Gán Cho (Assign To)', placeholder: 'Tên người hoặc bộ phận xử lý...', type: 'input' },
];

// Define the fields for the "Close" form
const closeFields: FormField[] = [
    { id: 'close-id', label: 'ID Sự Cố', placeholder: 'Nhập ID sự cố để đóng...', type: 'input' },
    { id: 'close-user', label: 'Người đóng', placeholder: 'Tên người đóng sự cố...', type: 'input' },
];

interface IncidentActionsProps {
    validUsers: string[];
    validMachines: MachineLookup[];
}

interface MachineLookup {
    id: string;   // The value the user inputs (for validation)
    type: string; // The corresponding machine type (for display/context)
}

/**
 * Main component to render the tabs and forms
 */
export const IncidentActions: React.FC<IncidentActionsProps> = ({ validUsers, validMachines }) => {
    const [activeTab, setActiveTab] = useState<ActionTab | null>(null);
    // State to hold validation messages/status for all possible fields
    const [validationStatus, setValidationStatus] = useState<Record<string, { message: string, isValid: boolean }>>({});

    const handleTabClick = (tabName: ActionTab) => {
        if (activeTab === tabName) {
            setActiveTab(null);
        } else {
            setActiveTab(tabName);
            // Optional: Clear validation status when switching tabs
            setValidationStatus({}); 
        }
    };
    
    // 💡 NEW: Centralized validation function triggered by form field changes
    const handleValidation = (id: string, value: string) => {
        let message = '';
        let isValid = true;
        const trimmedValue = value.trim();

        if (['register-reporter', 'assign-user', 'close-user'].includes(id)) { 
            if (!trimmedValue) {
                // Required check
                message = `${id.includes('reporter') ? 'Reporter' : 'Assignee'} is required.`;
                isValid = false;
            } else if (validUsers.includes(trimmedValue)) {
                // User lookup check (Success)
                message = 'Valid User.';
            } else {
                // User lookup check (Failure)
                message = 'Invalid or unrecognized user name.';
                isValid = false;
            }
        }
        
        // 2. Validation for Register Machine ID
        else if (id === 'register-machine') {
            const foundMachine = validMachines.find(m => m.id === trimmedValue);
            if (!trimmedValue) {
                message = 'Machine ID is required.';
                isValid = false;
            } else if (foundMachine) {
                // Success: Show the machine type
                message = `Valid ID. Machine Type: ${foundMachine.type}`;
            } else {
                message = 'Invalid Machine ID. Please check the ID.';
                isValid = false;
            }
        }

        else if (['register-summary', 'assign-id', 'close-id'].includes(id)) {
            if (!trimmedValue) {
                // Dynamically generate the field name (e.g., 'summary', 'id', 'notes')
                message = `${id.split('-')[1]} is required.`;
                isValid = false;
            }
            // If it's not empty, it's considered valid for simple text fields.
        }
        
        // Update the status only for fields where validation logic ran
        if (message) {
            setValidationStatus(prev => ({ ...prev, [id]: { message, isValid } }));
        } else {
            // Clear message/status if validation is not needed for this field type 
            // or if the field is empty and we don't want to show an error yet.
            setValidationStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[id];
                return newStatus;
            });
        }
    };


    // --- SUBMIT HANDLERS (Simplified validation removed, relies on real-time state) ---
    
    const handleRegisterSubmit = (formData: Record<string, string>) => {
        console.log("Submitting new incident (Validation passed):", formData);
        // Actual API call/Firestore write goes here...
        setActiveTab(null);
        setValidationStatus({});
    };

    const handleAssignSubmit = (formData: Record<string, string>) => {
        console.log("Assigning incident (Validation passed):", formData);
        // Actual API call/Firestore write goes here...
        setActiveTab(null);
        setValidationStatus({});
    };

    const handleCloseSubmit = (formData: Record<string, string>) => {
        console.log("Closing incident (No complex validation needed):", formData);
        // Actual API call/Firestore write goes here...
        setActiveTab(null);
        setValidationStatus({});
    };

    // Renders the correct form based on the active tab
    const renderActiveForm = () => {
        // Shared props for the ReusableForm
        const sharedFormProps = {
            onFieldChange: handleValidation,
            validationStatus: validationStatus
        };

        switch (activeTab) {
            case 'register':
                return <ReusableForm 
                    fields={registerFields} 
                    onSubmit={handleRegisterSubmit} 
                    submitLabel="Đăng Ký Sự Cố" 
                    {...sharedFormProps}
                />;
            case 'assign':
                return <ReusableForm 
                    fields={assignFields} 
                    onSubmit={handleAssignSubmit} 
                    submitLabel="Gán Trách Nhiệm" 
                    {...sharedFormProps}
                />;
            case 'close':
                // Note: For 'close' fields, simple required checks are done implicitly
                return <ReusableForm 
                    fields={closeFields} 
                    onSubmit={handleCloseSubmit} 
                    submitLabel="Đóng Sự Cố" 
                    {...sharedFormProps}
                />;
            default:
                return null;
        }
    };

    // Helper to get conditional classes for active/inactive tabs
    const getTabClassName = (tabName: ActionTab) => {
        const isActive = activeTab === tabName;
        return `
            px-4 py-2 text-sm font-medium rounded-t-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-indigo-400
            ${isActive
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
        `;
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-4">
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
            {activeTab && (
                <div className="bg-white p-4 rounded-b-lg rounded-r-lg shadow-lg border border-gray-200">
                    {renderActiveForm()}
                </div>
            )}
        </div>
    );
};