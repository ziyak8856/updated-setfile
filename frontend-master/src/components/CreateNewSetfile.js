import React, { useEffect, useState } from "react";
import Navbar1 from "./CreateNewSetfileNavbar";
import FileList from "./CreateNewSetfileFileList";
import CloneFIleDataTable from "./CloneFIleDataTable";
import "../styles/Dashboard.css"; // reuse same styling
import CloneFromAny from "./CloneFromAny";
const CreateSetfilePage = () => {
 
  const [selectedSetFiles, setSelectedSetFiles] = useState({});
  const [setfilePrefix, setSetfilePrefix] = useState("");
  const[generatedSetfileName,setgeneratedSetfileName]=useState("");
  const [selectedModes, setSelectedModes] = useState(null);
  const [selectedMkclTable, setSelectedMkclTable] = useState("");
  const [selectedMkclTableFromClone,setSelectedMkclTableFromClone]=useState("");
  const [ShowCloneFIleDataTable,setShowCloneFIleDataTable]=useState(false);
  const [ShowCloneFromAny,setShowCloneFromAny]=useState(false);
  useEffect(() => {
    if (selectedMkclTable!=""&&selectedMkclTableFromClone!=""&&selectedMkclTable==selectedMkclTableFromClone) {
          setShowCloneFIleDataTable(true);
          setShowCloneFromAny(false);
    }else if(selectedMkclTable!=""&&selectedMkclTableFromClone!=""&&selectedMkclTable!=selectedMkclTableFromClone){
      setShowCloneFIleDataTable(false);
      setShowCloneFromAny(true);
    }else{
      setShowCloneFIleDataTable(false);
      setShowCloneFromAny(false);
    }
}, [selectedMkclTable,selectedMkclTableFromClone]);
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
        selectedMkclTable={selectedMkclTable}
        setSelectedMkclTable={setSelectedMkclTable}
      />
      
      <div className="dashboard-container expanded">
       {
        ShowCloneFIleDataTable && (<div className="section data-table">
          
          <CloneFIleDataTable
           selectedSetFiles={selectedSetFiles}
           setfilePrefix={setfilePrefix}
           generatedSetfileName={generatedSetfileName}
           selectedModes={selectedModes}
          />
        </div>)}
        {
        ShowCloneFromAny && (<div className="section data-table">
          
          <CloneFromAny
           selectedSetFiles={selectedSetFiles}
           setfilePrefix={setfilePrefix}
           generatedSetfileName={generatedSetfileName}
           selectedModes={selectedModes}
          />
        </div>)}
        
        <div className="section file-list">
        
          <FileList
          selectedSetFiles={selectedSetFiles}
          setSelectedSetFiles={setSelectedSetFiles}
          selectedMkclTableFromClone={selectedMkclTableFromClone}
          setSelectedMkclTableFromClone={setSelectedMkclTableFromClone}
          
        />
        </div>
      </div>
    </div>
  );
};

export default CreateSetfilePage;