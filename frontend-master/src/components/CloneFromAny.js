import React, { useState, useEffect } from "react";
import {
  fetchTableNameBySettingId,
  fetchTableData,
  fetchRegmap,
  addSetfile
} from "../services/api";
import "../styles/FileData.css";

const { stringify } = require('json-stringify-safe');
const CloneFromAny = ({ selectedSetFiles,setfilePrefix ,generatedSetfileName,selectedModes}) => {
  const [tableNames, setTableNames] = useState({});
const [tableData, setTableData] = useState([]);
const [editedCells, setEditedCells] = useState({});
const [editingCell, setEditingCell] = useState(null);
const [columns, setColumns] = useState(["serial_number", "Tunning_param"]);
const [displayFormat, setDisplayFormat] = useState("hex");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [newRows, setNewRows] = useState([]);
const [regmapContent, setRegmapContent] = useState("Loading regmap content...");
const [focusedRow, setFocusedRow] = useState(null);
const[deleted,setDeletedRows] = useState([]);
const [changesSaved, setChangesSaved] = useState(false);

useEffect(() => {
  const fetchAndSetRegmap = async () => {
    const projectId = localStorage.getItem("projectId");
    if (projectId) {
      try {
        setLoading(true); // Start loading
        const data = await fetchRegmap(projectId);
        
        if (data) {
          setRegmapContent(data); // Set the fetched regmap content
        } else {
          setRegmapContent("Error: Failed to fetch or parse regmap data.");
        }
      } catch (err) {
        console.error("Error fetching regmap:", err);
        setError("Failed to fetch regmap.");
        setLoading(false);
      } finally {
      
      }
    } else {
      console.warn("No projectId found in localStorage");
      setRegmapContent("No project ID found.");
      setLoading(false); // Stop loading
    }
  };
   setLoading(false);
  fetchAndSetRegmap();
}, []); // ✅ Only runs once when the component mounts
useEffect(() => {
  const fetchTableNames = async () => {
    setLoading(true);
    setError("");

    try {
      const newTableNames = {};

      await Promise.all(
        Object.values(selectedSetFiles).map(async (file) => {
          if (!newTableNames[file.setting_id]) {
            const tableName = await fetchTableNameBySettingId(file.setting_id);
            newTableNames[file.setting_id] = tableName || "Unknown Table";
          }
        })
      );

      if (JSON.stringify(newTableNames) !== JSON.stringify(tableNames)) {
        setTableNames(newTableNames);
      }

    } catch {
      setError("Failed to fetch table names.");
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  if (Object.keys(selectedSetFiles).length > 0) {
    fetchTableNames();
  } else {
    resetState();
  }
// ✅ Do not include tableNames to avoid loops
}, [selectedSetFiles]);

useEffect(() => {
  const fetchData = async () => {
    if (!Object.keys(tableNames).length || !Object.keys(selectedSetFiles).length) {
      resetState();
      return;
    }

    setLoading(true);
    setError("");

    try {
      const mergedData = {};
      const dynamicColumns = new Set(["serial_number", "Tunning_param"]);

      await Promise.all(
        Object.values(selectedSetFiles).map(async (file) => {
          const tableName = tableNames[file.setting_id];
          const columnName = file.name;

          if (tableName && columnName) {
            const data = await fetchTableData(tableName, columnName);
            if (data?.rows) {
              dynamicColumns.add(columnName);
              data.rows.forEach((row) => {
                const id = row.id;
                if (!mergedData[id]) {
                  mergedData[id] = {
                    id: row.id,
                    serial_number: row.serial_number,
                    Tunning_param: row.Tunning_param,
                    setting_id: file.setting_id,
                  };
                }
                mergedData[id][columnName] = row[columnName] ?? "-";
              });
            }
          }
        })
      );

      const newColumns = [...dynamicColumns];
      const mergedArray = Object.values(mergedData).sort((a, b) => a.serial_number - b.serial_number);

      setColumns((prev) => (JSON.stringify(prev) !== JSON.stringify(newColumns) ? newColumns : prev));
      setTableData((prev) => (JSON.stringify(prev) !== JSON.stringify(mergedArray) ? mergedArray : prev));

    } catch (err) {
      console.error("Error fetching table data:", err);
      setError("Failed to fetch table data.");
    } finally {
      setLoading(false);
    }
  };
   setLoading(false)
  fetchData();
// ✅ Rely only on meaningful changes
}, [JSON.stringify(tableNames), JSON.stringify(selectedSetFiles)]);

// \U0001f9f9 Resets all state to defaults
const resetState = () => {
  setTableData([]);
  setColumns(["serial_number", "Tunning_param"]);
  setTableNames({});
  setEditedCells({});
  setEditingCell(null);
  setNewRows([]);
};

const convertValue = (value) => {
  if (!value || value === "-") return "-";
  return displayFormat === "hex" ? value.toString().toUpperCase() : parseInt(value, 16);
};
const handleChange = (e, rowId, colName) => {
  const newValue = e.target.value;
  const isNewRow = newRows.some(nr => nr.tempId === rowId);

  // Update tableData
  setTableData(prev => {
    return prev.map(row => {
      if (row.id !== rowId) return row;

      const updatedRow = { ...row, [colName]: newValue };

      // If Tunning_param is changed, fill values from regmap
      if (colName === "Tunning_param") {
        const regmapEntry = regmapContent[newValue]?.Value;

        if (regmapEntry !== undefined) {
          columns.forEach(col => {
            if (
              !["id", "serial_number", "setting_id", "Tunning_param"].includes(col)
            ) {
              updatedRow[col] = regmapEntry;
            }
          });
        }
      }

      return updatedRow;
    });
  });

  // Update editedCells
  if (!isNewRow) {
    setEditedCells(prev => {
      const updated = {
        ...prev[rowId],
        [colName]: newValue,
      };

      if (colName === "Tunning_param") {
        const regmapEntry = regmapContent[newValue]?.Value;

        if (regmapEntry !== undefined) {
          columns.forEach(col => {
            if (
              !["id", "serial_number", "setting_id", "Tunning_param"].includes(col)
            ) {
              updated[col] = regmapEntry;
            }
          });
        }
      }

      return {
        ...prev,
        [rowId]: updated,
      };
    });
  }
};


const handleAddRow = (refRow) => {
  const newTempId = `temp-${Date.now()}`;
  const index = tableData.findIndex(row => row.id === refRow.id);
  const prev = tableData[index];
  const next = tableData[index + 1];

  let newSerial = next
    ? (parseFloat(prev.serial_number) + parseFloat(next.serial_number)) / 2
    : parseFloat(prev.serial_number) + 1;

  const newRow = {
    id: newTempId,
    setting_id: refRow.setting_id,
    serial_number: newSerial,
    Tunning_param: "",
  };

  columns.forEach(col => {
    if (!["id", "serial_number", "Tunning_param", "setting_id"].includes(col)) {
      newRow[col] = null;
    }
  });

  setTableData(prev => {
    const updated = [...prev];
    updated.splice(index + 1, 0, newRow);
    return updated;
  });

  setNewRows(prev => [
    ...prev,
    {
      tempId: newTempId,
      refId: next?.id ?? refRow.id,
      position: "below",
      rowData: newRow,
    },
  ]);
};
// \U0001f9e0 Unified Save Button
const handleDeleteRow = (rowId) => {
  const rowToDelete = tableData.find(row => row.id === rowId);
  if (!rowToDelete) return;

  const isTemp = rowId.toString().startsWith("temp");

  // Immediately delete temp row from frontend
  if (isTemp) {
    setTableData(prev => prev.filter(row => row.id !== rowId));
    setNewRows(prev => prev.filter(row => row.tempId !== rowId));
    return;
  }

  const confirmed = window.confirm("Are you sure you want to delete this row?");
  if (!confirmed) return;

  setDeletedRows(prev => [...prev, rowToDelete]); // Store full row object
  console.log(rowToDelete, "rowToDelete");
  setTableData(prev => prev.filter(row => row.id !== rowId)); // Remove from UI
};
const handleSaveAllChanges = async () => {
    try {
      
      const file = Object.values(selectedSetFiles)[0]; // The only selected file
  
      if (!file) {
        alert("No setfile selected.");
        return;
      }
        const simplifiedData = tableData.map(row => {
        const { id, serial_number, Tunning_param, setting_id, ...rest } = row;
        const value = Object.values(rest)[0]; // get the single value inside the rest object
        const regmapEntry = regmapContent[Tunning_param]?.Value;
        const isComment=Tunning_param.trim().startsWith("//");
        const defaultparamValue= isComment ? null: (regmapEntry !== undefined ? regmapEntry : value);
        return {
            Tunning_param,
            value,
            defaultparamValue
        };
        });
        console.log("simplifiedData",simplifiedData);
        
       const addSetfileResponse = await addSetfile(
        selectedModes,
        file.setting_id,
        setfilePrefix,
        generatedSetfileName,
        file.selectedmv
      );   
      setChangesSaved(true);
      setLoading(false);
      alert("Setfile cloned and all changes saved successfully.");
    } catch (error) {
      console.error("Error in handleSaveAllChanges:", error);
      alert("An error occurred while saving changes.");
    }
  };
  


const Genratesetfile = async () => {
//   const finalRowData = {};
//  // console.log(tableData)
//   tableData.forEach(col => {
//     Object.keys(col).forEach(key => {
//       if (key !== "id" && key !== "serial_number" && key !== "setting_id" && key !== "Tunning_param") {
//         let keyoffile = col["Tunning_param"];
//         const val = col[key];
       
//         if (!(keyoffile.startsWith("//"))) keyoffile = "WRITE #" + keyoffile;
//         const p = keyoffile + " " + val;
//         const nkey=col["setting_id"]+"$"+key;
//         // If the key doesn't exist in finalRowData, create an array
//         if (!finalRowData[nkey]) {
//           finalRowData[nkey] = [];
//         }
        
//         // Push the new value into the array
//         finalRowData[nkey].push(p);
//       }
//     });
//   });
  
  
//  //Create a downloadable text file for each key
//   for (const key in finalRowData) {
//    // console.log(key);
//     const [setting_id,name]=key.split("$");
//    // console.log(setting_id);
//  //   console.log(name);
//      let Nname;
//      for(const key1 in selectedSetFiles){
//       console.log("key",key);
//        if(selectedSetFiles[key1].name==name&&selectedSetFiles[key1].setting_id==setting_id){
//         // console.log("key",key);
//         // console.log(selectedSetFiles[key1].full_name);
//         Nname=selectedSetFiles[key1].full_name;
//         break;
//        }
//      }
   
//     const dataToWrite = finalRowData[key].join('\n'); // Join array values with new line
//     const blob = new Blob([dataToWrite], { type: 'text/plain' });
//     const url = URL.createObjectURL(blob);
    
//     // Create a link element
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `${Nname}.nset`; // Set the file name
//     document.body.appendChild(a);
//     a.click(); // Trigger the download
//     document.body.removeChild(a); // Clean up
//     URL.revokeObjectURL(url); // Free up memory
//   }

  // console.log(finalRowData);
  // console.log(selectedSetFiles)
  // console.log( JSON.stringify(selectedSetFiles))
  // console.log(selectedModes);
 // console.log(tableData);

};

// Call the function (make sure to define tableData before calling)
return (
    <div>
    {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      
  <div style={{ padding: "20px", maxWidth: "100%", maxHeight: '83vh' }}>
       <button
      onClick={Genratesetfile}
      style={{
        marginBottom: "12px",
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      genrate setfiles
    </button>
     <button
      onClick={() => setDisplayFormat(displayFormat === "hex" ? "dec" : "hex")}
      style={{
        marginBottom: "12px",
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
    >
      Switch to {displayFormat === "hex" ? "Decimal" : "Hexadecimal"}
    </button>
      {(Object.keys(editedCells).length > 0 || newRows.length > 0|| deleted.length > 0||(generatedSetfileName!=""&& JSON.stringify(selectedSetFiles)!="{}")) && (
        <button onClick={handleSaveAllChanges} style={{
          marginTop: "20px",
          marginLeft: "20px",
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "14px"
        }}>
          Save All Changes
        </button>
      )}
      <div style={{ position: "relative", marginLeft: "30px", maxHeight: '82vh', overflowY: "auto" }}>
      <table style={{
        borderCollapse: "collapse",
        width: "100%",
        backgroundColor: "#fff",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        position: "relative",
        marginLeft: "30px",
        border: '1px solid #ddd',
        overflowX: "auto"
      }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 1 ,border: '1px solid #ddd'}}>
          <tr style={{ backgroundColor: "#f1f1f1",border: '1px solid #ddd' }}>
            <th style={{ padding: "12px", textAlign: "left",border: '1px solid #ddd' }}>Serial</th>
            {columns
              .filter(col => col !== "serial_number" && col !== "id")
              .map(col => (
                <th key={col} style={{ padding: "12px", textAlign: "left" }}>{col}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {tableData.length > 0 && (
            <tr style={{ height: "0px", position: "relative" }}>
              <td colSpan={columns.length} style={{ padding: 0, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  left: "-30px",
                  top: "50%",
                  transform: "translateY(-50%)"
                }}
              >
                <button
                  onClick={() => handleAddRow(tableData[0])}
                  style={{
                    fontSize: "14px",
                    padding: "4px 8px",
                    borderRadius: "50%",
                    border: "1px solid #ccc",
                    backgroundColor: "#e9ecef",
                    cursor: "pointer",
                    lineHeight: "1"
                  }}
                >
                  +
                </button>
                </div>
              </td>
            </tr>
          )}

          {tableData.map(row => (
            <React.Fragment key={row.id}>
              <tr style={{ borderBottom: "1px solid #ddd",border: '1px solid #ddd' }}>
                <td style={{ padding: "10px" ,border: '1px solid #ddd'}}>{row.serial_number || "-"}</td>
                {columns
                  .filter(col => col !== "serial_number" && col !== "id")
                  .map(col => (
                    <td
                      key={`${row.id}-${col}`}
                      onDoubleClick={() =>
                        setEditingCell({ rowId: row.id, colName: col })
                      }
                      style={{
                        padding: "10px",
                        backgroundColor: editedCells?.[row.id]?.[col]
                          ? "#fff3cd"
                          : "transparent",
                        cursor: "pointer",
                        border: '1px solid #ddd'
                      }}
                      
                    >
                      {editingCell?.rowId === row.id &&
                      editingCell?.colName === col ? (
                        col === "Tunning_param" ? (
                          <div className="autocomplete-wrapper">
                            <input
                              autoFocus
                              value={
                                editedCells?.[row.id]?.[col] ?? row[col] ?? ""
                              }
                              onChange={e => handleChange(e, row.id, col)}
                              onBlur={() => setEditingCell(null)}
                              style={{
                                width: "100%",
                                padding: "6px",
                                fontSize: "14px",
                                boxSizing: "border-box"
                              }}
                              onFocus={() => setFocusedRow(row.id)}
                            
                            />
                              
                            {focusedRow === row.id && (
                              <div className="suggestion-box">
                                {Object.keys(regmapContent)
                                  .filter(key =>
                                    key
                                      .toLowerCase()
                                      .includes(
                                        (
                                          editedCells?.[row.id]?.[col] ??
                                          row[col] ??
                                          ""
                                        ).toLowerCase()
                                      )
                                  )
                                  .slice(0, 50)
                                  .map((key, index) => (
                                    <div
                                      key={index}
                                      className="suggestion-item"
                                      onMouseDown={() => {
                                        handleChange(
                                          { target: { value: key } },
                                          row.id,
                                          col
                                        );
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
                            autoFocus
                            value={
                              editedCells?.[row.id]?.[col] ?? row[col] ?? ""
                            }
                            onChange={e => handleChange(e, row.id, col)}
                            onBlur={() => setEditingCell(null)}
                            style={{
                              width: "100%",
                              padding: "6px",
                              fontSize: "14px",
                              boxSizing: "border-box"
                            }}
                          />
                        )
                      ) : col !== "Tunning_param" ? (
                        convertValue(row[col])
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
                 <td>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteRow(row.id)}
                  >
                    Delete
                  </button>
                </td>

              </tr>
              <tr style={{ height: "0px", position: "relative" }}>
                <td colSpan={columns.length} style={{ padding: 0, position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: "-30px",
                    top: "50%",
                    transform: "translateY(-50%)"
                  }}
                >
                  <button
                    onClick={() => handleAddRow(row)}
                    style={{
                      fontSize: "14px",
                      padding: "4px 8px",
                      borderRadius: "50%",
                      border: "1px solid #ccc",
                      backgroundColor: "#e9ecef",
                      cursor: "pointer",
                      lineHeight: "1"
                    }}
                  >
                    +
                  </button>
                  </div>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  </div>
);
};

export default CloneFromAny;