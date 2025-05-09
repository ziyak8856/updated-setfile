import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

// Set auth headers
const getAuthHeaders = () => ({
  headers: { Authorization: localStorage.getItem("token") },
});

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Login failed. Please try again.";
  }
};
export const fetchProjects = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const fetchProjectById = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching project details:", error);
    throw error;
  }
};

// Create a new project
export const createProject = async (formData) => {
  try {
    //      formData.forEach((value, key) => {
    //   console.log(key, value);  
    //  });
    const response = await axios.post(`${API_BASE_URL}/projects`, formData, {
      headers: { "Content-Type": "multipart/form-data", ...getAuthHeaders().headers },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Project creation failed.";
  }
};

// Fetch customers under a project
export const fetchCustomers = async (projectId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/customers/${projectId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw error;
  }
};

// Add a new customer to a project
export const addCustomers = async (projectId, customers,selectedIndexes) => {
  try {
    console.log("selectedIndexes",selectedIndexes);
    const response = await axios.post(
      `${API_BASE_URL}/customers`,
      { projectId, customers,selectedIndexes },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Adding customers failed.";
  }
};

// Fetch all settings for a customer
export const fetchSettings = async (customerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/settings/${customerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

// Add a new setting to a customer
export const addSettings = async (settings,uniqueArray1) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/settings`, { settings,uniqueArray1 }, getAuthHeaders());
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Settings creation failed.";
  }
};


// Fetch all modes for a customer
export const fetchModes = async (customerId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/modes/${customerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching modes:", error);
    throw error;
  }
};

// Add a new mode for a customer
export const addMode = async ({ customer_id, name }) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/modes`,
      { customer_id, name },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Adding mode failed.";
  }
};

export const uploadRegmap = async ({ file, projectId, name }) => {
  try {
    const formData = new FormData();
    formData.append("regmap", file);
    formData.append("projectId", projectId);
    formData.append("name", name);
          formData.forEach((value, key) => {
      console.log(key, value);  
     });
    const response = await axios.post(`${API_BASE_URL}/projects/upload-regmap`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...getAuthHeaders().headers, // Include auth headers if needed
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Regmap upload failed.";
  }
};
export const addSetting = async (customerId, name, tableName) => {
  console.log("setiing",customerId, name, tableName);
  try {
    const response = await axios.post(`${API_BASE_URL}/settings/add`, {
      customer_id: customerId,
      name,
      table_name: tableName,
    },getAuthHeaders());

    return response.data;
  } catch (error) {
    console.error("Error adding setting:", error);
    throw error;
  }
};
 
export const getCustomerById = async (customerId) => {
  try {
    console.log("customerrr",customerId);
    const response = await axios.get(`${API_BASE_URL}/customers/single/${customerId}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
};
export const fetchSetFilesbyMode = async (modeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/setfile/getSetFiles?mode_id=${modeId}`,getAuthHeaders());
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API error:", error);
    return { message: "Error fetching data" };
  }
};
export const fetchTableNameBySettingId = async (settingId) => {
  try {
    console.log("settingId",settingId);
    const response = await fetch(`${API_BASE_URL}/settings/getTableName/${settingId}`, getAuthHeaders());
    const data = await response.json();
    return data.table_name;
  } catch (error) {
    console.error("Error fetching table name:", error);
    return "Unknown";
  }
};
// Ensure these are correctly imported

export const fetchTableData = async (tableName, columnName) => {
  console.log("tableName:", tableName);
  console.log("columnName:", columnName);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/get-table-data`,
      { tableName, columnName }, // Send as request body
      {
        headers: { ...getAuthHeaders().headers }, // Include authentication headers
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching table data:", error);
    throw error;
  }
};
 

export const updateRowAPI = async (tableName, id, columnName, value,regmapEntry) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/update-row`,
      { tableName, id, columnName, value,regmapEntry },
      {
        headers: { ...getAuthHeaders().headers },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating row:", error);
    throw error;
  }
};

export const addRowAPI = async (tableName, referenceId, position, rowData,defaultValue) => {
  
  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/add-row`,
      { tableName, referenceId, position, rowData,defaultValue },
      {
        headers: { ...getAuthHeaders().headers },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding row:", error);
    throw error;
  }
};

export const fetchRegmap = async (projectId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/projects/regmap/${projectId}`, getAuthHeaders());
    const fileBlob = await response.blob(); // Get the file as a Blob
    const text = await fileBlob.text(); // Convert the Blob into text
    // console.log("Raw Text from Regmap:", text);

    // Parse the text content
    const lines = text.trim().split("\n");
    const regex = /#define\s+(\w+)\s+0x([0-9A-Fa-f]+)\s+\/\/\s+0x([0-9A-Fa-f]+)\s/;
    const data = {};

    lines.forEach(line => {
      const match = line.match(regex);
      if (match) {
        const [_, name, value, offset] = match;
        data[name] = {
          Address: value,
          Value: offset
        };
      }
    });

   // console.log("Parsed Regmap Data:", data);
    return data;

  } catch (err) {
    console.error("Error fetching or parsing regmap:", err);
    return null;
  }
};

export const deleteRowAPI = async (tableName, rowId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/delete-row`,
      { tableName, rowId },
      {
        headers: { ...getAuthHeaders().headers },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting row:", error);
    return { success: false };
  }
};
export const markFileAsDeleted = async (file) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/mark-deleted`,
      file,
      { headers: { ...getAuthHeaders().headers } }
    );
    return response.data;
  } catch (error) {
    console.error("Error marking file as deleted:", error);
    throw error;
  }
};
export const updateMVHeaderForFile = async (fileId, selectedmv,selectedCustomer,selectedIndexes) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/update-mv`,
      { file_id: fileId, selectedmv,selectedCustomer,selectedIndexes },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update MV headers.";
  }
};
export const updateMVHeaderForCustomer = async (customerId, selectedIndexes) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/customers/update-mv`,
      {customerId, selectedIndexes },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update MV headers.";
  }
}
export const cloneFromsetfile = async (tableName,setfilePrefix, existingcolumnName) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/clone-from`,
      {tableName,setfilePrefix, existingcolumnName },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update MV headers.";
  }
}
export const addSetfile = async (mode_id,setting_id,setfilePrefix,generatedSetfileName,selectedmv) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/setfile/add-setfile`,
      {mode_id,setting_id,setfilePrefix,generatedSetfileName,selectedmv },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Failed to update MV headers.";
  }
}