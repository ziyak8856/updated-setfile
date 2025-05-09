import React, { useEffect, useState } from "react";
import "../styles/addcus.css";
import { updateMVHeaderForCustomer, getCustomerById } from "../services/api"; // Adjust paths as needed

const mergedGroups = [
  // MV4 headers
  "//$MV4[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
  "//$MV4_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]",
  "//$MV4_Scramble[enable:[*SCRAMBLE_EN*]]",
  "//$MV4_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
  "//$MV4_Start[]",
  // MV6 headers
  "//$MV6[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
  "//$MV6_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]",
  "//$MV6_Scramble[enable:[*SCRAMBLE_EN*]]",
  "//$MV6_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
  "//$MV6_Start[]"
];

const EditCustomerModal = ({ isOpen, onClose, customerId }) => {
  const [loading, setLoading] = useState(true);
  const [showMv4, setShowMv4] = useState(true);
  const [showMv6, setShowMv6] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  useEffect(() => {
    if (isOpen && customerId) {
      setLoading(true);
      getCustomerById(customerId)
        .then((customer) => {
          if (customer?.selectedmv) {
            const indexes = customer.selectedmv
              .split(",")
              .map((i) => parseInt(i.trim()))
              .filter((i) => !isNaN(i));
            setSelectedIndexes(indexes);
          } else {
            setSelectedIndexes([]);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch customer:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, customerId]);

  const handleCheckboxChange = (index) => {
    setSelectedIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleSave = async () => {
    try {
      await updateMVHeaderForCustomer(customerId, selectedIndexes);
      alert("changed mv header of all setfile under customer!");
      onClose();
    } catch (err) {
      console.error("Failed to update MV headers:", err);
      alert("Failed to update MV headers.");
    }
  };

  
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="h2">Select MV Headers</h2>
  
        <div className="form-group">
          <label className="h4">
            <input
              type="checkbox"
              checked={showMv4}
              onChange={() => setShowMv4(!showMv4)}
            />
            Add MV4 Header
          </label>
          {showMv4 && (
            <div className="mv-container">
              {mergedGroups.slice(0, 10).map((line, i) => (
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
            />
            Add MV6 Header
          </label>
          {showMv6 && (
            <div className="mv-container">
              {mergedGroups.slice(10).map((line, i) => (
                <label key={i + 10} className="mv-line">
                  <input
                    type="checkbox"
                    checked={selectedIndexes.includes(i + 10)}
                    onChange={() => handleCheckboxChange(i + 10)}
                  />
                  {line}
                </label>
              ))}
            </div>
          )}
        </div>
  
        <div style={{ display: 'flex', gap: '30px', marginTop: '10px', justifyContent: 'center' }}>
  <button
    onClick={handleSave}
    style={{
      padding: '10px 16px',
      border: 'none',
      width: '100px',
      borderRadius: '6px',
      fontSize: '14px',
      cursor: 'pointer',
      backgroundColor: '#28a745',
      color: '#fff',
      transition: 'all 0.2s ease-in-out',
    }}
  >
    Save
  </button>

  <button
    onClick={onClose}
    style={{
      padding: '10px 16px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      width: '100px',
      cursor: 'pointer',
      backgroundColor: '#6c757d',
      color: '#fff',
      transition: 'all 0.2s ease-in-out',
    }}
  >
    Cancel
  </button>
</div>

      </div>
    </div>
  );
  

};

export default EditCustomerModal;