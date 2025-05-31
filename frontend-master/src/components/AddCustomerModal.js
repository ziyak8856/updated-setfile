import React, { useEffect, useState } from "react";
import { addCustomers } from "../services/api";
import "../styles/addcus.css";

const mergedGroups = [
    "//$MV4[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
    "//$MV4_Sensor[fps:[*FPS*]]",
    "//$MV4_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]]",
    "//$MV4_Scramble[enable:[*SCRAMBLE_EN*]]",
    "//$MV4_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
    "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
    "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
    "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
    "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
    "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
    "//$MV4_SFR[address:[*SFR_ADDRESS_1*],data:[*SFR_DATA_1*]]",
    "//$MV4_SFR[address:[*SFR_ADDRESS_2*],data:[*SFR_DATA_2*]]",
    "//$MV4_SFR[address:[*SFR_ADDRESS_3*],data:[*SFR_DATA_3*]]",
    "//$MV4_SFR[address:[*SFR_ADDRESS_4*],data:[*SFR_DATA_4*]]",
    "//$MV4_SFR[address:[*SFR_ADDRESS_5*],data:[*SFR_DATA_5*]]",
    "//$MV4_SFR[address:[*SFR_ADDRESS_6*],data:[*SFR_DATA_6*]]",
    "//$MV4_SFR[address:[*SFR_ADDRESS_7*],data:[*SFR_DATA_7*]]",
    "//$MV4_Start[]",

    "//$MV6[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
    "//$MV6_Sensor[fps:[*FPS*]]",
    "//$MV6_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]]",
    "//$MV6_Scramble[enable:[*SCRAMBLE_EN*]]",
    "//$MV6_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
    "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
    "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
    "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
    "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
    "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
    "//$MV6_SFR[address:[*SFR_ADDRESS_1*],data:[*SFR_DATA_1*]]",
    "//$MV6_SFR[address:[*SFR_ADDRESS_2*],data:[*SFR_DATA_2*]]",
    "//$MV6_SFR[address:[*SFR_ADDRESS_3*],data:[*SFR_DATA_3*]]",
    "//$MV6_SFR[address:[*SFR_ADDRESS_4*],data:[*SFR_DATA_4*]]",
    "//$MV6_SFR[address:[*SFR_ADDRESS_5*],data:[*SFR_DATA_5*]]",
    "//$MV6_SFR[address:[*SFR_ADDRESS_6*],data:[*SFR_DATA_6*]]",
    "//$MV6_SFR[address:[*SFR_ADDRESS_7*],data:[*SFR_DATA_7*]]",
    "//$MV6_Start[]"
];

const AddCustomerModal = ({ isOpen, onClose }) => {
  const [customerInputs, setCustomerInputs] = useState([""]);
  const [selectedIndexes, setSelectedIndexes] = useState([]);
  const [showMv4, setShowMv4] = useState(true);
  const [showMv6, setShowMv6] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const projectId = localStorage.getItem("projectId");
  const projectName=localStorage.getItem("projectName");

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleInputChange = (index, value) => {
    const updated = [...customerInputs];
    updated[index] = value;
    setCustomerInputs(updated);
  };

  const handleAddMore = () => {
    setCustomerInputs([...customerInputs, ""]);
  };

  const handleCheckboxChange = (index) => {
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter(i => i !== index));
    } else {
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  const handleSubmit = async () => {
    if (!projectId) return setError("Project ID is missing.");

    const filteredCustomers = customerInputs.filter(name => name.trim() !== "");
    if (filteredCustomers.length === 0) return setError("Please enter at least one customer.");
    if (selectedIndexes.length === 0) return setError("Please select at least one MV line.");

   // const selectedmv = selectedIndexes.join(",");
    setLoading(true);

    try {
      await addCustomers(projectId, filteredCustomers, selectedIndexes,projectName);
      setCustomerInputs([""]);
      setSelectedIndexes([]);
      setError("");
      alert("Customers added successfully!");
      onClose();
    } catch (err) {
      setError("Error adding customers");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="h2">Add Customers</h2>
        {customerInputs.map((customer, index) => (
          <input
            key={index}
            type="text"
            value={customer}
            onChange={(e) => handleInputChange(index, e.target.value)}
            placeholder={`Customer ${index + 1}`}
            className="modal-input"
          />
        ))}

        <div className="form-group">
          <label className="h4">
            <input
              type="checkbox"
              checked={showMv4}
              onChange={() => setShowMv4(!showMv4)}
            /> Add MV4 Header
          </label>
          {showMv4 && (
            <div className="mv-container">
              {mergedGroups.slice(0, 18).map((line, i) => (
                <label key={i} className="mv-line">
                  <input
                    type="checkbox"
                    checked={selectedIndexes.includes(i)}
                    onChange={() => handleCheckboxChange(i)}
                  />
                  {line}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="h4">
            <input
              type="checkbox"
              checked={showMv6}
              onChange={() => setShowMv6(!showMv6)}
            /> Add MV6 Header
          </label>
          {showMv6 && (
            <div className="mv-container">
              {mergedGroups.slice(18).map((line, i) => (
                <label key={i + 18} className="mv-line">
                  <input
                    type="checkbox"
                    checked={selectedIndexes.includes(i + 18)}
                    onChange={() => handleCheckboxChange(i + 18)}
                  />
                  {line}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button className="add-more-btn" onClick={handleAddMore}>+ Add More</button>
          <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}
        <button className="close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default AddCustomerModal;