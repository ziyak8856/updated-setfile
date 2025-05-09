import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Navbar.css";
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
import EditCustomerModal from "./EditCustomerModal";
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

const Navbar = ({className, selectedModes, setSelectedModes, selectedCustomer, setSelectedCustomer }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const projectName =
    localStorage.getItem("projectName") || "No Project Selected";
  const projectId = localStorage.getItem("projectId");

  // const [selectedModes, setSelectedModes] = useState([]);
  //const [valueType, setValueType] = useState("hex");
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [customers, setCustomers] = useState([]); // Store customers list
  //const [selectedCustomer, setSelectedCustomer] = useState(""); // Store selected customer
  //const [isModalOpen, setModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false); // Control alert display
  const [modes, setModes] = useState([]);
  // const [isModeModalOpen, setModeModalOpen] = useState(false);
  // const [projectDetails, setProjectDetails] = useState(null);
  const [uniqueVariables, setUniqueVariables] = useState([]);
  const [mkclTables, setMkclTables] = useState([]);
  const [selectedMkclTables, setSelectedMkclTables] = useState([]);
  const[isEditModalOpen,setEditModalOpen] = useState(false);
 
const toggleSelectiontable = (tableName) => {
    setSelectedMkclTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((t) => t !== tableName)
        : [...prev, tableName]
    );
  };
  
const handleLogout = () => {
    ["token", "user", "projectId", "projectName"].forEach(item => localStorage.removeItem(item));
    navigate("/");
};

const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        setSelectedFile(file);
        setMessage(""); // Clear previous message
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
        await uploadRegmap({
            file: selectedFile,
            projectId,
            name: projectName
        });

        setMessage("Regmap uploaded successfully!");
        setShowAlert(true);
        setSelectedFile(null);
    } catch (error) {
        console.error("Upload failed:", error);
        setMessage("Failed to upload regmap: " + error.message);
        setShowAlert(true);
    }
};

useEffect(() => {
    if (projectId) {
        fetchProjectDetails(projectId);
        fetchCustomersList(projectId);
    }
}, [projectId]); // Runs when projectId changes

const fetchCustomersList = async (projectId) => {
    try {
        const data = await fetchCustomers(projectId);
        setCustomers(data);
    } catch (error) {
        console.error("Failed to fetch customers:", error);
    }
};

const handleCustomerChange = (event) => {
    event.preventDefault();
    setSelectedCustomer(event.target.value);
    setModes([]); // Clear previous modes
    setSelectedModes([]);
    console.log("Selected customer:",selectedCustomer);
};
useEffect(() => {
  if (selectedCustomer) {
    fetchCustomerById(selectedCustomer); // Fetch customer details
    fetchModesList(selectedCustomer);
    fetchTables();
    // setSelectedModes([]); // Reset selected modes
  }else{
    setModes([]);
    setSelectedModes([]);
  }
}, [selectedCustomer]);
const fetchModesList = async (customerId) => {
  try {
    const data = await fetchModes(customerId);
    setModes(data);
    setSelectedModes([]); // Reset selected modes
  } catch (error) {
    console.error("Failed to fetch modes:", error);
  }
};
const fetchCustomerById = async (customerId) => {
  try {   
    const data = await getCustomerById(customerId);
  
   extractUniqueVariables(data.selectedmv.split(",")); // Extract unique variables from selected mv
   // console.log("Selected MV Array:", selectedmv); // Log selected mv array
  } catch (error) {
    console.error("Failed to fetch customer data:", error); 
  }
};  
const handleModeSelection = (modeId) => {
  setSelectedModes((prevSelectedModes) => {
    const updatedModes = prevSelectedModes.includes(modeId)
      ? prevSelectedModes.filter((id) => id !== modeId) // Unselect mode
      : [...prevSelectedModes, modeId]; // Select mode

    console.log("Selected Modes:", updatedModes); // Log selected modes
    return updatedModes;
  });
};
const fetchProjectDetails = async (projectId) => {
  try {
      const data = await fetchProjectById(projectId);
    
  } catch (error) {
      console.error("Failed to fetch project details:", error);
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
console.log("Updated unique variablesfromnav:", uniqueVariables);
}, [uniqueVariables]);

const fetchTables = async () => {
try {
  const data = await fetchSettings(selectedCustomer);
  setMkclTables(data);
  setSelectedMkclTables([]); // Reset selection on customer change
} catch (error) {
  console.error("Error fetching MKCL tables:", error);
}
};

  return (
    <nav className={`navbar ${className}`}>
      {/* Top Section: User Info & Actions */}
      <div className="navbar-top">
        <div className="user-project">
          <img src={userIcon} alt="User Icon" className="user-icon" />
          <span className="project-name">
            {user ? user.name : "Not Logged In"}
          </span>
          <img src={projectIcon} alt="Project Icon" className="project-icon" />
          <h2 className="project-name">{projectName}</h2>
        </div>

        <div className="navbar-buttons">
        <button  className="nav-btn" 
                 onClick={() => setEditModalOpen(true)} 
                 disabled={!selectedCustomer}>
                 EditMV
                 </button>
        <EditCustomerModal 
                isOpen={isEditModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                customerId={selectedCustomer} />

          <label className="upload-btn">
            Upload Regmap
            <input
              type="file"
              onChange={handleFileChange}
              className="file-input"
            />
          </label>
          <button
            className="nav-btn"
            onClick={handleUpload}
            disabled={!selectedFile}
          >
            Submit
          </button>
          {showAlert && message && window.alert(message)}{" "}
          {/* Show alert once */}
          <select
            className="nav-select"
            value={selectedCustomer}
            onChange={handleCustomerChange}
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <button
            className="nav-btn"
            onClick={() => navigate("/create-setfile")}
          >
            Create Setfile
          </button>
          <button className="nav-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Bottom Section: Mode, MKCL Tables & Value Selection */}
      <div className="navbar-bottom">

        {/* MKCL Table Selection */}
        <div className="mkcl-section">
          <h3>MCLK TABLES:</h3>
          <div className="radio-container">
            {mkclTables.map((table) => (
              <label key={table.table_name} className="radio-label">
                <input
                  type="checkbox"
                  value={table.table_name}
                  checked={selectedMkclTables.includes(table)}
                  onChange={() => toggleSelectiontable(table)}
                />
                {table.name}
              </label>
            ))}
          </div>
        </div>

        {/* Mode Selection */}
        <div className="mode-section">
          <h3>MODES:</h3>
          <div className="radio-container">
            {modes.map((mode) => (
              <label key={mode.id} className="radio-label">
                <input
                  type="checkbox"
                  value={mode.id}
                  checked={selectedModes.includes(mode)}
                  onChange={() => handleModeSelection(mode)}
                />
                {mode.name}
              </label>
            ))}
          </div>
        </div>
        
        
      </div>

    </nav>
  );
};

export default Navbar;