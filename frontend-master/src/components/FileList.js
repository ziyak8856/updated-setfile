import React, { useEffect, useState } from "react";
import { fetchSetFilesbyMode,markFileAsDeleted } from "../services/api";
import "../styles/FileList.css";
import MVHeaderSelector from "./MVHeaderSelector";
const FileList = ({ selectedModes, selectedSetFiles, setSelectedSetFiles,selectedCustomer }) => {
  const [fileData, setFileData] = useState([]); // Store all setfiles across modes
  const [showMVModal, setShowMVModal] = useState(false);
  const [currentEditingFile, setCurrentEditingFile] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!Array.isArray(selectedModes) || selectedModes.length === 0||selectedModes==null) {
        setFileData([]);
        setSelectedSetFiles({});
        return;
      }
      console.log("customerformfile",selectedCustomer);
      const newFileData = [];
      for (const mode of selectedModes) {
        const data = await fetchSetFilesbyMode(mode.id);
        if (data.files) {
          newFileData.push({ mode, files: data.files });
        }
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
    setSelectedSetFiles((prev) => {
      const updated = { ...prev };
      if (updated[file.id]) {
        delete updated[file.id];
      } else {
        updated[file.id] = file;
      }
      return updated;
    });
  };

  const handleDeleteFile = async (fileToDelete) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${fileToDelete.full_name}"?`);
    if (!confirmDelete) return;

    setSelectedSetFiles((prev) => {
      const updated = { ...prev };
      delete updated[fileToDelete.id];
      return updated;
    });

    setFileData((prevData) =>
      prevData.map(({ mode, files }) => ({
        mode,
        files: files.filter((file) => file.id !== fileToDelete.id),
      }))
    );

    try {
      await markFileAsDeleted(fileToDelete);
      alert(`"${fileToDelete.full_name}" has been successfully deleted.`);
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert(`Failed to delete "${fileToDelete.full_name}".`);
    }
  };

  const openMVEditor = (file) => {
    setCurrentEditingFile(file);
    setShowMVModal(true);
  };

  const handleMVSave = (updatedMV) => {
    const fileToEdit = currentEditingFile;
    if (!fileToEdit) return;

    // Update local state
    setFileData((prevData) =>
      prevData.map(({ mode, files }) => ({
        mode,
        files: files.map((file) =>
          file.id === fileToEdit.id ? { ...file, selectedmv: updatedMV } : file
        ),
      }))
    );

    setSelectedSetFiles((prev) => {
      const updated = { ...prev };
      if (updated[fileToEdit.id]) {
        updated[fileToEdit.id] = { ...updated[fileToEdit.id], selectedmv: updatedMV };
      }
      return updated;
    });

    setShowMVModal(false);
    setCurrentEditingFile(null);
    alert(`MV updated for "${fileToEdit.full_name}".`);
  };
  
  return (
    <div>
      <ul className="mode-list1">
        {fileData.map(({ mode, files }) => (
          <li key={mode.id} className="mode-item1">
            <h3 className="mode-name1">{mode.name}</h3>
            <ul className="file-list1">
              {files.map((file) => (
                <li key={file.id} className="file-item1">
                  <input
                    type="checkbox"
                    id={file.id}
                    checked={!!selectedSetFiles[file.id]}
                    onChange={() => handleCheckboxChange(file)}
                  />
                  <label htmlFor={file.id}>{file.full_name}</label>
                  <button className="delete-button" onClick={() => openMVEditor(file)}>
                    MV
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteFile(file)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      {showMVModal && currentEditingFile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <MVHeaderSelector
              selectedmv={currentEditingFile.selectedmv || ""}
              fileId={currentEditingFile.id}
              selectedCustomer={selectedCustomer}
              onSave={handleMVSave}
              onClose={() => {
                setShowMVModal(false);
                setCurrentEditingFile(null);
              }}
            />
          </div>
        </div>
      )}
      {/* {console.log("Selected Set Files:", selectedSetFiles)}   */}
    </div>
  );
};

export default FileList;