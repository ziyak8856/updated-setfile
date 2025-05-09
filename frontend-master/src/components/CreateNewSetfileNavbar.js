import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userIcon from "../assets/icons8-user-50-2.png";
import projectIcon from "../assets/project.png";
import {
  uploadRegmap,
  fetchCustomers,
  fetchModes,
  fetchProjectById,
  fetchSettings,
  getCustomerById,
} from "../services/api";
import AddCustomerModal from "./AddCustomerModal";
import AddModeModal from "./AddModeModal";
import AddMkclTableModal from "./AddMkclTableModal";

import "../styles/CreateNewSetfileNavbar.css";
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

const CreateNewSetfileNavbar = ({style, selectedModes, setSelectedModes }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const projectName = localStorage.getItem("projectName") || "No Project Selected";
  const projectId = localStorage.getItem("projectId");

  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [modes, setModes] = useState([]);
  const [uniqueVariables, setUniqueVariables] = useState([]);
  const [isModeModalOpen, setModeModalOpen] = useState(false);
  const [mkclTables, setMkclTables] = useState([]);
  const [selectedMkclTable, setSelectedMkclTable] = useState("");
  const [ismkclModalOpen, setmkclModalOpen] = useState(false);
  const [setfilePrefix, setSetfilePrefix] = useState("");
  const [setfileSuffix, setSetfileSuffix] = useState("");
  const [fps, setFps] = useState("");
  const [resolution, setResolution] = useState("");

  const handleLogout = () => {
    ["token", "user", "projectId", "projectName"].forEach((item) =>
      localStorage.removeItem(item)
    );
    navigate("/");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      setShowAlert(true);
      return;
    }
    if (!projectId || !projectName) {
      setMessage("Project ID or Name is missing.");
      setShowAlert(true);
      return;
    }
    try {
      await uploadRegmap({ file: selectedFile, projectId, name: projectName });
      setMessage("Regmap uploaded successfully!");
      setShowAlert(true);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage("Failed to upload regmap: " + error.message);
      setShowAlert(true);
    }
  };

  const fetchCustomersList = async (projectId) => {
    try {
      const data = await fetchCustomers(projectId);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const handleCustomerChange = (event) => {
    const selectedId = event.target.value;
    setSelectedCustomer(selectedId);
    setSelectedModes("");
    setSelectedMkclTable("");
  };

  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId).then((data) => console.log(data));
      fetchCustomersList(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (selectedCustomer && customers.length > 0) {
      const customerObj = customers.find((c) => String(c.id) === String(selectedCustomer));
      setSelectedCustomerName(customerObj?.name || "");
    }
  }, [selectedCustomer, customers]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerById(selectedCustomer);
      fetchModes(selectedCustomer).then(setModes);
      fetchSettings(selectedCustomer).then(setMkclTables);
    } else {
      setModes([]);
      setMkclTables([]);
    }
  }, [selectedCustomer]);
  const fetchCustomerById = async (customerId) => {
    try {   
      const data = await getCustomerById(customerId);
      //setSelectedmv(data.selectedmv.split(",")); // Assuming selectedmv is a comma-separated string
     // console.log("Selected MV:", data.selectedmv); // Log selected mv
     extractUniqueVariables(data.selectedmv.split(",")); // Extract unique variables from selected mv
     // console.log("Selected MV Array:", selectedmv); // Log selected mv array
    } catch (error) {
      console.error("Failed to fetch customer data:", error); 
    }
  };  
  const extractUniqueVariables = (mvArr) => {
    console.log("Selected MV1 Array:", mvArr); // Log selected mv array
   const regex = /\[\*(.*?)\*\]/g;
   let variables = new Set(); // Using Set to ensure uniqueness

    const extractFromText = (text) => {
        if (!text) return;
        let match;
        while ((match = regex.exec(text)) !== null) {
            variables.add(match[1]); // Extract matched value inside [* *]
        }
    };
      for (let i = 0; i < mvArr.length; i++) {
        const mv = mergedGroups[mvArr[i]];
        extractFromText(mv); // Extract variables from each mv
      }
      setUniqueVariables([...variables]);

  //    // Convert Set to Array
   console.log("Unique Variables:", uniqueVariables); // Log unique variables
};
useEffect(() => {
  if(uniqueVariables.length)
  console.log("Updated unique variables:", uniqueVariables);
}, [uniqueVariables]);
  const generatedSetfileName = `${setfilePrefix || "prefix"}_${selectedCustomerName || "customer"}_${projectName}_${(modes.find(m => String(m.id) === String(selectedModes))?.name || "mode")}_${resolution || "res"}_${fps || "fps"}${setfileSuffix ? `_${setfileSuffix}` : ''}.nset`;

  return (
    <nav style={style}>
    <nav className="create-new-setfile-navbar">
      <div className="create-new-setfile-navbar-top">
        <div className="create-new-setfile-user-project">
          <img src={userIcon} alt="User Icon" className="create-new-setfile-icon" />
          <span>{user ? user.name : "Not Logged In"}</span>
          <img src={projectIcon} alt="Project Icon" className="create-new-setfile-icon" />
          <h3>{projectName}</h3>
        </div>

        <div className="create-new-setfile-navbar-buttons">
          <button className="create-new-setfile-btn" onClick={() => navigate('/dashboard')}>Go To Sensor Homepage</button>
          <label className="create-new-setfile-btn">
            Upload Regmap
            <input type="file" onChange={handleFileChange} style={{ display: "none" }} />
          </label>

          <button className="create-new-setfile-btn" onClick={handleUpload} disabled={!selectedFile}>Submit</button>
          {showAlert && message && window.alert(message)}

          <select className="create-new-setfile-select" value={selectedCustomer} onChange={handleCustomerChange}>
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>

          <button className="create-new-setfile-btn" onClick={() => setModalOpen(true)}>Add Customer</button>
          <AddCustomerModal
            isOpen={isModalOpen}
            onClose={() => {
              setModalOpen(false);
              fetchCustomersList(projectId);
            }}
          />

          {/* <button className="create-new-setfile-btn">Edit</button>
          <button className="create-new-setfile-btn">Save to DB</button>
          <button className="create-new-setfile-btn" onClick={() => navigate('/create-setfile')}>Create Setfile</button> */}
          <button className="create-new-setfile-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="combined">
      <div className="create-new-setfile-section">
        <div className="create-new-setfile-mode-row">
          <label className="create-new-setfile-label">Mode:</label>
          <select className="create-new-setfile-select" value={selectedModes} onChange={(e) => setSelectedModes(e.target.value) }>
         <h2> selectedModes</h2>
            <option value="">Select Mode</option>
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>{mode.name}</option>
            ))}
          </select>
          <button className="create-new-setfile-btn" onClick={() => setModeModalOpen(true)}>Add Mode</button>
        </div>
        <AddModeModal
          isOpen={isModeModalOpen}
          onClose={() => setModeModalOpen(false)}
          customerId={selectedCustomer}
          refreshModes={() => fetchModes(selectedCustomer).then(setModes)}
        />
      </div>

      <div className="create-new-setfile-section">
        <div className="create-new-setfile-dropdown-row">
          <label className="create-new-setfile-label">MKCL Table:</label>
          <select className="create-new-setfile-select" value={selectedMkclTable} onChange={(e) => setSelectedMkclTable(e.target.value)}>
            <option value="">Select MIPI Datarate</option>
            {mkclTables.map((table) => (
              <option key={table.table_name} value={table.table_name}>{table.name}</option>
            ))}
          </select>
          <button className="create-new-setfile-btn" onClick={() => setmkclModalOpen(true)}>Add MIPI Datarate</button>
        </div>
        <AddMkclTableModal
          isOpen={ismkclModalOpen}
          onClose={() => setmkclModalOpen(false)}
          projectName={projectName}
          customerName={selectedCustomer}
          customerId={selectedCustomer}
          uniqueArray1={uniqueVariables}
          refreshModes={() => fetchSettings(selectedCustomer).then(setMkclTables)}
        />
      </div>
      </div>

      <div className="create-new-setfile-section create-new-setfile-inputs">
        <input
          type="text"
          placeholder="Setfile Name Prefix"
          value={setfilePrefix}
          onChange={(e) => setSetfilePrefix(e.target.value)}
          className="create-new-setfile-input"
        />
        <input
          type="text"
          placeholder="Resolution"
          value={resolution}
          onChange={(e) => setResolution(e.target.value)}
          className="create-new-setfile-input"
        />
        <input
          type="text"
          placeholder="FPS"
          value={fps}
          onChange={(e) => setFps(e.target.value)}
          className="create-new-setfile-input"
        />
        <input
          type="text"
          placeholder="Setfile Name Suffix"
          value={setfileSuffix}
          onChange={(e) => setSetfileSuffix(e.target.value)}
          className="create-new-setfile-input"
        />
      </div>

      <div className="create-new-setfile-section">
        <h3 className="create-new-setfile-label">Setfile Name:</h3>
        <div className="create-new-setfile-display">
          <strong>{generatedSetfileName}</strong>
        </div>
      </div>
    </nav>
    </nav>
  );
};

export default CreateNewSetfileNavbar;