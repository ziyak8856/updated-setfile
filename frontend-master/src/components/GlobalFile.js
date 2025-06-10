import React, { useState, useEffect, useRef } from "react";
import "../styles/FileData.css";
import { fetchRegmap } from "../services/api";

const GlobalFile = ({ globalData, setGlobalData }) => {
  const { tableData, selectedFile, fileName } = globalData;
  const [regmapContent, setRegmapContent] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [focusedRow, setFocusedRow] = useState(null);
  const inputRef = useRef(null);

  // Default file content
  const defaultFileContent = `// This file is generated using Setfile Manager 2.0
    // Global File Start. Add your global variables here.
    WRITE #DEFAULT_PARAM1 0000
    WRITE #DEFAULT_PARAM2 0000`;
  const defaultFileName = "default.nset";

  useEffect(() => {
    const fetchAndSetRegmap = async () => {
      const projectId = localStorage.getItem("projectId");
      if (projectId) {
        try {
          const data = await fetchRegmap(projectId);
          if (data) setRegmapContent(data);
        } catch (err) {
          console.error("Error fetching regmap:", err);
        }
      }
    };
    fetchAndSetRegmap();

    // Set default file if no file is selected
    if (!selectedFile) {
      setGlobalData((prev) => ({
        ...prev,
        fileName: defaultFileName,
        selectedFile: defaultFileContent,
      }));
      parseUploadedFile(defaultFileContent);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setEditingCell(null);
      }
    };
    if (editingCell) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [editingCell]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setGlobalData((prev) => ({ ...prev, fileName: file.name }));
    const text = await file.text();
    if (text) {
      setGlobalData((prev) => ({ ...prev, selectedFile: text }));
      parseUploadedFile(text);
    }
  };

  const parseUploadedFile = (text) => {
    const lines = text.trim().split("\n");
    const result = {};

    lines.forEach((line) => {
      if (line.startsWith("//")) {
        result[line.trim()] = "";
      } else {
        const regex = /WRITE\s+#(\w+)\s+(.+)/;
        const match = line.match(regex);
        if (match) {
          const [_, Name, hexVal] = match;
          result[Name] = hexVal;
        }
      }
    });

    setGlobalData((prev) => ({
      ...prev,
      regmapContent: result,
      tableData: lines.map((line) => {
        if (line.startsWith("//")) {
          return {
            Tunning_param: line.trim(),
            DefaultValue: "-",
            Value: "",
          };
        }
        const regex = /WRITE\s+#(\w+)\s+(.+)/;
        const match = line.match(regex);
        if (match) {
          const [_, Name, hexVal] = match;
          return {
            Tunning_param: Name,
            DefaultValue: regmapContent?.[Name]?.Value ?? "-",
            Value: hexVal,
          };
        }
        return null;
      }).filter((row) => row !== null),
    }));
  };

  const handleChange = (e, rowIndex, colName) => {
    const newValue = e.target.value;
    
    setGlobalData((prev) => {
      const updatedTable = [...prev.tableData];
      updatedTable[rowIndex][colName] = newValue;
      if (colName === "Tunning_param") {
        updatedTable[rowIndex]["DefaultValue"] = regmapContent?.[newValue]?.Value ?? "-";
        updatedTable[rowIndex]["Value"] = regmapContent?.[newValue]?.Value ?? "-";
      }
      return { ...prev, tableData: updatedTable };
    });
  };

  const handleAddRow = (insertIndex = null) => {
    const newRow = { Tunning_param: "", DefaultValue: "-", Value: "" };
    setGlobalData((prev) => {
      const updated = [...prev.tableData];
      if (insertIndex !== null) {
        updated.splice(insertIndex + 1, 0, newRow);
      } else {
        updated.push(newRow);
      }
      return { ...prev, tableData: updated };
    });
  };

  const handleDeleteRow = (param) => {
    if (!window.confirm("Are you sure you want to delete this row?")) return;
    setGlobalData((prev) => ({
      ...prev,
      tableData: prev.tableData.filter((row) => row.Tunning_param !== param),
    }));
  };

  const generateDownloadFile = () => {
    let fileContent = "";
    tableData.forEach((row) => {
      const { Tunning_param, Value } = row;
      if (Tunning_param.startsWith("//")) {
        fileContent += `\n${Tunning_param}\n`;
      } else if (Tunning_param && Value) {
        fileContent += `WRITE #${Tunning_param}   ${Value}\n`;
      }
    });

    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "0px" }}>
      <h3 style={{ display: "inline-block", marginRight: "10px" }}>Global Settings</h3>
      {/* <h5 style={{ marginTop: "-10px", color: "#D36A6C"}}>For new global (if not exist) create a empty file, add initial comment and upload.</h5> */}
      <input type="file" accept=".nset" onChange={handleFileUpload} style={{cursor: "pointer"}} />
      <button style={{backgroundColor: "#007bff",
                      color: "#fff",
                      border: "2px solid white",
                      padding: "5px 5px", /* Smaller padding */
                      borderRadius: "5px",
                      fontSize: "12px", /* Reduced font size */
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      marginLeft: "10px" }} 
            onClick={() => parseUploadedFile(selectedFile)}>
        Show File Data
      </button>
      <button onClick={generateDownloadFile} style={{ 
                      backgroundColor: "#007bff",
                      color: "#fff",
                      border: "2px solid white",
                      padding: "5px 5px", /* Smaller padding */
                      borderRadius: "5px",
                      fontSize: "12px", /* Reduced font size */
                      fontWeight: "bold",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      marginLeft: "10px"
                    }}>
        Download Updated File
      </button>

      <div style={{ maxHeight: "78vh", overflowY: "auto", marginTop: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "rgb(221, 221, 221)" }}>
            <tr>
              <th style={{ width: "50px" }}></th> {/* for + button */}
              <th style={{ padding: "12px", border: "1px solid #ddd", minWidth: "400px" }}>Tunning_param</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>DefaultValue</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Value</th>
              <th style={{ padding: "12px", border: "1px solid #ddd" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td style={{ textAlign: "center", position: "relative", minWidth: "30px" }}>
                  <button
                    onClick={() => handleAddRow(index)}
                    style={{
                      position: "absolute",
                      bottom: "-12px",
                      right: "3px",
                      fontSize: "14px",
                      padding: "4px 8px",
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                      backgroundColor: "#e9ecef",
                      cursor: "pointer",
                      lineHeight: "1",
                    }}
                  >
                    +
                  </button>
                </td>
                {["Tunning_param", "DefaultValue", "Value"].map((col) => (
                  <td
                    key={col}
                    onDoubleClick={() =>
                      col !== "DefaultValue" && setEditingCell({ rowId: index, colName: col })
                    }
                    style={{
                      border: "1px solid #ddd",
                      padding: "10px",
                      cursor: col !== "DefaultValue" ? "pointer" : "not-allowed",
                      backgroundColor:
                        editingCell?.rowId === index && editingCell?.colName === col
                          ? "#fff3cd"
                          : "transparent",
                    }}
                  >
                    {editingCell?.rowId === index && editingCell?.colName === col ? (
                      col === "Tunning_param" ? (
                        <div className="autocomplete-wrapper">
                          <input
                            ref={inputRef}
                            autoFocus
                            value={row[col]}
                            onChange={(e) => handleChange(e, index, col)}
                            onFocus={() => setFocusedRow(index)}
                            style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                          />
                          {focusedRow === index && (
                            <div className="suggestion-box">
                              {Object.keys(regmapContent)
                                .filter((key) =>
                                  key.toLowerCase().includes(row[col]?.toLowerCase() || "")
                                )
                                .slice(0, 50)
                                .map((key, idx) => (
                                  <div
                                    key={idx}
                                    className="suggestion-item"
                                    onMouseDown={() => {
                                      handleChange({ target: { value: key } }, index, col);
                                      setEditingCell(null);
                                    }}
                                  >
                                    {key}
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <input
                          ref={inputRef}
                          autoFocus
                          value={row[col]}
                          onChange={(e) => handleChange(e, index, col)}
                          style={{ width: "100%", padding: "6px", fontSize: "14px" }}
                        />
                      )
                    ) : (
                      row[col]
                    )}
                  </td>
                ))}
                <td style={{ border: "1px solid #ddd", padding: "10px" }}>
                  <button
                    onClick={() => handleDeleteRow(row.Tunning_param)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#f44336",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalFile;