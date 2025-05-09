import React, { useState } from "react";
import Navbar1 from "./CreateNewSetfileNavbar";
import FileDataTable from "./FileDataTable";
import FileList from "./CreateNewSetfileFileList";
import "../styles/Dashboard.css"; // reuse same styling

const CreateSetfilePage = () => {
  const [selectedModes, setSelectedModes] = useState(null);
  const [selectedSetFiles, setSelectedSetFiles] = useState({});

  return (
    <div>
      {/* Navbar */}
      <Navbar1
        selectedModes={selectedModes}
        setSelectedModes={setSelectedModes}
      
      />
      
      <div className="dashboard-container expanded">
        {/* File Data Table only */}
        <div className="section data-table">
          {/* <h2>File Data Table</h2> */}
          <FileDataTable selectedSetFiles={selectedSetFiles} />
        </div>
        {/* File List */}
        <div className="section file-list">
        
          <FileList
          selectedSetFiles={selectedSetFiles}
          setSelectedSetFiles={setSelectedSetFiles}
          
        />
        </div>
      </div>
    </div>
  );
};

export default CreateSetfilePage;