import { useState } from "react";
import { addSetting ,getCustomerById} from "../services/api";


const AddMkclTableModal = ({ isOpen, onClose, projectName, customerName, customerId,uniqueArray1,refreshModes }) => {
  const [interfaceType, setInterfaceType] = useState("cphy");
  const [clockRate, setClockRate] = useState("");
  console.log(projectName, customerName, customerId,uniqueArray1);
  const handleSubmit = async () => {
    if (!clockRate.trim()) {
      alert("Please enter a valid clock rate.");
      return;
    }
 
    try {
      // Fetch customer details
      const data = await getCustomerById(customerId);
      const updatedCustomerName = data.name;
     // Construct table name
      const tableName = `${projectName}_${updatedCustomerName}_${interfaceType}_${clockRate}`;
      // Add new setting to database
      const naa=`${interfaceType}_${clockRate}`
      await addSetting(customerId,naa,tableName,projectName,updatedCustomerName);
      alert("MKCL Table added successfully!");
      onClose(); // Close modal after successful submission
    } catch (error) {
      console.error("Error handling MKCL Table addition:", error.message);
      alert("An error occurred while adding the table. Please try again.");
    }
  };

  if (!isOpen) return null;  // Don't render the modal if not open

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="h2">Add MIPI Datarate</h2>

        <div className="input-group">
          {/* <label className="radio-container">Interface Type:</label> */}
          <div>
            <label className="radio-label h2">
              <input
                type="radio"
                value="cphy"
                checked={interfaceType === "cphy"}
                onChange={() => setInterfaceType("cphy")}
              />
              CPHY
            </label>
            <label className="radio-label h2">
              <input
                type="radio"
                value="dphy"
                checked={interfaceType === "dphy"}
                onChange={() => setInterfaceType("dphy")}
              />
              DPHY
            </label>
          </div>
        </div>

        <div className="input-group">
          <label>Clock Rate:</label>
          <input
            type="text"
            value={clockRate}
            onChange={(e) => setClockRate(e.target.value)}
            placeholder="Enter clock rate"
          />
        </div>

        <div className="modal-actions">
          <button onClick={handleSubmit} className="submit-btn">Add</button>
          <button onClick={onClose} className="close-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddMkclTableModal;