import React, { useEffect, useState } from "react";
import "../styles/addcus.css";
import { updateMVHeaderForFile } from "../services/api"; // Adjust the import path as necessary

const MVHeaderSelector = ({ selectedmv = "", fileId,selectedCustomer, onSave, onClose }) => {
  const [showMv4, setShowMv4] = useState(true);
  const [showMv6, setShowMv6] = useState(true);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const mergedGroups = [
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

  useEffect(() => {
    if (selectedmv) {
      const indexes = selectedmv
        .split(",")
        .map((i) => parseInt(i.trim()))
        .filter((i) => !isNaN(i));
      setSelectedIndexes(indexes);
    }
  }, [selectedmv]);

  const handleCheckboxChange = (index) => {
    setSelectedIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleSave = async () => {
    const selectedString = selectedIndexes.join(",");
  
    try {

        console.log("file",fileId)
      await updateMVHeaderForFile(fileId, selectedString,selectedCustomer,selectedIndexes);
      alert("done!");
      onSave(selectedString);
      onClose();
    } catch (error) {
      console.error("Error updating selectedmv:", error);
      alert(error);
    }
  };

  return (
    <div className="mv-modal">
      <h2>Select MV Headers</h2>

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
          /> Add MV6 Header
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

      <div className="modal-actions">
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
};

export default MVHeaderSelector;