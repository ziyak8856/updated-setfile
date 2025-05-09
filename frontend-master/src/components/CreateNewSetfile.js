import React, { useState } from "react";
import Navbar1 from "./CreateNewSetfileNavbar";

import FileList from "./CreateNewSetfileFileList";
import CloneFIleDataTable from "./CloneFIleDataTable";
import "../styles/Dashboard.css"; // reuse same styling

const CreateSetfilePage = () => {
 
  const [selectedSetFiles, setSelectedSetFiles] = useState({});
  const [setfilePrefix, setSetfilePrefix] = useState("");
  const[generatedSetfileName,setgeneratedSetfileName]=useState("");
  const [selectedModes, setSelectedModes] = useState(null);
  return (
    <div>
      {/* Navbar */}
      <Navbar1
        
        setfilePrefix={setfilePrefix}
        setSetfilePrefix={setSetfilePrefix}
        generatedSetfileName={generatedSetfileName}
        setgeneratedSetfileName={setgeneratedSetfileName}
        selectedModes={selectedModes}
        setSelectedModes={setSelectedModes}

      />
      
      <div className="dashboard-container expanded">
        {/* File Data Table only */}
        <div className="section data-table">
          {/* <h2>File Data Table</h2> */}
          <CloneFIleDataTable
           selectedSetFiles={selectedSetFiles}
           setfilePrefix={setfilePrefix}
           generatedSetfileName={generatedSetfileName}
           selectedModes={selectedModes}
           setSelectedSetFiles={setSelectedSetFiles}
          />
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