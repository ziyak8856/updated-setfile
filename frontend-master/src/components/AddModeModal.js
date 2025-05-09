import React, { useState } from "react";
import { addMode } from "../services/api";
import "../styles/addcus.css";

const AddModeModal = ({ isOpen, onClose, customerId, refreshModes }) => {
    const [modeInputs, setModeInputs] = useState([""]); // Start with one input field
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Handle input changes
    const handleInputChange = (index, value) => {
        const updatedModes = [...modeInputs];
        updatedModes[index] = value;
        setModeInputs(updatedModes);
    };

    // Add more input fields
    const handleAddMore = () => {
        setModeInputs([...modeInputs, ""]);
    };

    // Submit all modes
    const handleSubmit = async () => {
        if (!customerId) {
            setError("Customer is not selected.");
            return;
        }

        const filteredModes = modeInputs.filter(name => name.trim() !== "");
        if (filteredModes.length === 0) {
            setError("Please enter at least one mode.");
            return;
        }

        setLoading(true);
        try {
            console.log(filteredModes);
            await Promise.all(filteredModes.map(modeName => addMode({customer_id:customerId, name:modeName})));
            alert("Modes added successfully!");
            setModeInputs([""]); // Reset input fields
            setError("");
            refreshModes(); // Refresh mode list
            onClose(); // Close modal
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2 className="h2">Add Modes</h2>
                {modeInputs.map((mode, index) => (
                    <input
                        key={index}
                        type="text"
                        value={mode}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder={`Mode ${index + 1}`}
                        className="modal-input"
                    />
                ))}
                <button className="add-more-btn" onClick={handleAddMore}>+ Add More</button>
                <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit"}
                </button>
                {error && <p className="error-message">{error}</p>}
                <button className="close-btn" onClick={onClose}>Close</button>
            </div>
        </div>
    );
};

export default AddModeModal;