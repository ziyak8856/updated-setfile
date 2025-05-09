import React, { useEffect, useState } from "react";
import { fetchCustomers ,fetchProjectById,fetchModes,fetchSettings,fetchSetFilesbyMode} from "../services/api";
import "../styles/FileList.css";


const FileList = ({selectedSetFiles,setSelectedSetFiles}) => {
  const [fileData, setFileData] = useState([]); // Store all setfiles across modes
  const [selectedModes, setSelectedModes] = useState(null);
  const [modes, setModes] = useState([]);
//   const [selectedSetFiles, setSelectedSetFiles] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [mkclTables, setMkclTables] = useState([]);
 const [selectedMkclTables, setSelectedMkclTables] = useState([]);
 const projectId = localStorage.getItem("projectId");
 useEffect(() => {
    const fetchData = async () => {
      const newFileData = [];
      const data = await fetchSetFilesbyMode(selectedModes);
      if (data.files) {
        newFileData.push({ selectedModes, files: data.files });
      }
      
      setFileData(newFileData);

      // Keep only selected files from active modes
      setSelectedSetFiles((prev) => {
        const updatedFiles = {};
        newFileData.forEach(({ files }) => {
          files.forEach((file) => {
            if (prev[file.id]) {
              updatedFiles[file.id] = prev[file.id];
            }
          });
        });
        return updatedFiles;
      });
    };

    fetchData();
  }, [selectedModes, setSelectedSetFiles]);

  const handleCheckboxChange = (file) => {
    setSelectedSetFiles({}); // Clear previously selected files
    setSelectedSetFiles((prev) => ({
      [file.id]: file, // Select the new file
    }));
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
    setSelectedMkclTables("");
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
     
    }
  }, [selectedCustomer, customers]);

  useEffect(() => {
    if (selectedCustomer) {
      fetchSettings(selectedCustomer).then(setMkclTables);
      fetchModes(selectedCustomer).then(setModes);
      
    } else {
      setModes([]);
      setMkclTables([]);
    }
  }, [selectedCustomer]);
  return (
    <div >
        <h1>Clone From Source</h1>
      <select className="create-new-setfile-select" value={selectedCustomer} onChange={handleCustomerChange}>
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
          
          <select className="create-new-setfile-select" value={selectedMkclTables} onChange={(e) => setSelectedMkclTables(e.target.value)}>
            <option value="">Select MCLK Table</option>
            {mkclTables.map((table) => (
              <option key={table.table_name} value={table.table_name}>{table.name}</option>
            ))}
          </select>
          
        
        
          <select className="create-new-setfile-select" value={selectedModes} onChange={(e) => setSelectedModes(e.target.value) }>
         <h2> selectedModes</h2>
            <option value="">Select Mode</option>
            {modes.map((mode) => (
              <option key={mode.id} value={mode.id}>{mode.name}</option>
            ))}
          </select>

          {fileData.map(({ mode, files }) => (
        <ul className="file-list1" key={mode}>
          {files.map((file) => (
            <li key={file.id} className="file-item1">
              <input
                type="checkbox"
                id={file.id}
                checked={!!selectedSetFiles[file.id]}
                onChange={() => handleCheckboxChange(file)}
              />
              <label htmlFor={file.id}>{file.full_name}</label>
            </li>
          ))}
        </ul>
      ))}
        
    </div>
  );
};

export default FileList;