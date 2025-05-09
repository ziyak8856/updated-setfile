import React, { useState } from "react";
import Navbar from "./Navbar";
import FileList from "./FileList";
import FileDataTable from "./FileDataTable";
import GlobalFile from "./GlobalFile";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const [showGlobal, setShowGlobal] = useState(true);
  const [showFileList, setShowFileList] = useState(true); // New state for File List visibility
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedModes, setSelectedModes] = useState(null);
  const [selectedSetFiles, setSelectedSetFiles] = useState({});

  const [globalData, setGlobalData] = useState({
    tableData: [],
    editedCells: {},
    selectedFile: null,
    fileName:"",
    // Add other states you want to preserve
  });
  return (
    <div >
      {/* Pass data and handlers to Navbar */}
      <Navbar
        className="sticky-navbar" // Add the sticky class here
        selectedModes={selectedModes}
        setSelectedModes={setSelectedModes}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
      />
     <div style={{ padding: "20px", maxWidth: "100%",overflowY:"auto"}}>
      <div className={`dashboard-container ${showGlobal ? "" : "expanded"} ${showFileList ? "" : "expanded-filelist"}`}>
        {/* Editable File Data Table */}
        <div className="section data-table">
          <FileDataTable selectedSetFiles={selectedSetFiles} />
        </div>

        {/* File List */}
        {showFileList && (
          <div className="section file-list">
            <button
              className="toggle-btn filelist"
              onClick={() => setShowFileList(false)} // Hide File List
            >
              <span className="toggle-icon">−</span>
            </button>
            <FileList
              selectedModes={selectedModes}
              selectedSetFiles={selectedSetFiles}
              setSelectedSetFiles={setSelectedSetFiles}
              selectedCustomer={selectedCustomer}
            />
          </div>
        )}

        {/* Show Button when File List is Hidden */}
        {!showFileList && (
          <button
            className="show-btn-filelist"
            onClick={() => setShowFileList(true)} // Show File List
          >
            <span className="toggle-icon">+</span>
            
          </button>
           
          
          
        )}

        {/* Global Data Section */}
         {/* Global Data Section */}
      {showGlobal && (
        <div className="section global-data">
          <button
            className="toggle-btn global"
            onClick={() => setShowGlobal(false)} // Hide Global Data
          >
            <span className="toggle-icon">−</span>
          </button>
          <GlobalFile 
            globalData={globalData} 
            setGlobalData={setGlobalData} 
          />
        </div>
      )}

      {/* Show Button when Global Data is Hidden */}
      {!showGlobal && (
        <button
          className="show-btn-global"
          onClick={() => setShowGlobal(true)} // Show Global Data
        >
          <span className="toggle-icon">+</span>
        </button>
      )}
      </div>
    </div>
    </div>
  );
};

export default Dashboard;