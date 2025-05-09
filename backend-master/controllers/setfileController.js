const pool = require("../config/db");

// Fetch all setfiles for a given mode_id
exports.getSetFiles = async (req, res) => {
  const { mode_id } = req.query;

  if (!mode_id) {
    return res.status(400).json({ message: "mode_id is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM setfile WHERE mode_id = ?",
      [mode_id]
    );

    if (rows.length > 0) {
      res.json({ files: rows }); // Send full data but only print names in frontend
    } else {
      res.status(404).json({ message: "No files found for this mode" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
 // Ensure the database connection pool is imported
 exports.getTableData = async (req, res) => {
  const { tableName, columnName } = req.body; // Extract from request body

  console.log("Received request for table:", tableName);
  console.log("Received request for column:", columnName);

  if (!tableName || !columnName) {
    return res.status(400).json({ error: "Missing table name or column name" });
  }

  try {
    const query = `
      SELECT id, serial_number, Tunning_param, \`${columnName}\` 
      FROM \`${tableName}\` 
      ORDER BY serial_number ASC
    `;

    const [rows] = await pool.query(query);
    // console.log("Fetched rows:", rows); 
    res.json({ columnName, rows });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Database query failed" });
  }
};
exports.addRow = async (req, res) => {
  const { tableName, referenceId, position, rowData, defaultValue } = req.body;
   console.log("Received request to add row:", req.body);
  try {
    // Step 1: Fetch serial_number of the reference row
    const [refRow] = await pool.query(
      `SELECT serial_number FROM \`${tableName}\` WHERE id = ?`,
      [referenceId]
    );
    if (refRow.length === 0) {
      return res.status(404).json({ error: "Reference row not found" });
    }

    // Step 2: Calculate new serial number
    let newSerial = refRow[0].serial_number ;

    // Step 3: Shift serial_numbers to make space
    await pool.query(
      `UPDATE \`${tableName}\` SET serial_number = serial_number + 1 WHERE serial_number >= ?`,
      [newSerial]
    );

    // Step 4: Fetch full column list from the table
    const [columnsInfo] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
    const allColumns = columnsInfo.map(col => col.Field);

    // Step 5: Prepare full row using rowData + defaultValue
    const newRow = {};
    for (const col of allColumns) {
      if (col === 'id' || col === 'serial_number') continue;
      newRow[col] = rowData[col] !== undefined ? rowData[col] : defaultValue;
    }

    // Step 6: Generate insert query
    const insertCols = Object.keys(newRow).map(col => `\`${col}\``).join(", ");
    const insertVals = Object.values(newRow);
    const placeholders = insertVals.map(() => "?").join(", ");

    const [insertResult] = await pool.query(
      `INSERT INTO \`${tableName}\` (${insertCols}, serial_number) VALUES (${placeholders}, ?)`,
      [...insertVals, newSerial]
    );

    // Step 7: Fetch and return the inserted row
    const [newRowData] = await pool.query(
      `SELECT * FROM \`${tableName}\` WHERE id = ?`,
      [insertResult.insertId]
    );

    res.json({ success: true, newRow: newRowData[0] });

  } catch (error) {
    console.error("Add row error:", error);
    res.status(500).json({ error: "Failed to add row" });
  }
};

exports.updateRow = async (req, res) => {
  const { tableName, id, columnName, value, regmapEntry } = req.body;
  console.log("Received request to update row:", req.body);

  try {
    // Case: Tunning_param + regmapEntry means update all other relevant columns too
    if (columnName === "Tunning_param" && regmapEntry !== undefined) {
      const [columnsResult] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\``);
      const allColumns = columnsResult.map(col => col.Field);

      // Exclude non-editable column
      const columnsToUpdate = allColumns.filter(col =>
        !["id", "serial_number", "Tunning_param"].includes(col)
      );

      // Construct SET clause
      const updateFields = ["`Tunning_param` = ?"];
      const updateValues = [value];

      for (const col of columnsToUpdate) {
        updateFields.push(`\`${col}\` = ?`);
        updateValues.push(regmapEntry);
      }

      updateValues.push(id); // WHERE id = ?

      const [updateResult] = await pool.query(
        `UPDATE \`${tableName}\` SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Row not found" });
      }

      return res.json({ success: true, updatedAll: true });
    }

    // Fallback: just update the one column normally
    const [updateResult] = await pool.query(
      `UPDATE \`${tableName}\` SET \`${columnName}\` = ? WHERE id = ?`,
      [value, id]
    );

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ error: "Row not found" });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error("Update row error:", error);
    return res.status(500).json({ error: "Failed to update row" });
  }
}; // Assuming db.js is in the parent directory

exports.deleteRow = async (req, res) => {
  const { tableName, rowId } = req.body;
  console.log("Received request to delete row:", req.body);

  if (!tableName || !rowId) {
    return res.status(400).json({ success: false, error: "Missing table name or rowId" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Step 1: Get the serial_number of the row to delete
    const [rows] = await connection.query(
      `SELECT serial_number FROM \`${tableName}\` WHERE id = ?`,
      [rowId]
    );

    if (rows.length === 0) {
      await connection.release();
      return res.status(404).json({ success: false, error: "Row not found" });
    }

    const deletedSerial = rows[0].serial_number;

    // Step 2: Delete the row
    const [deleteResult] = await connection.query(
      `DELETE FROM \`${tableName}\` WHERE id = ?`,
      [rowId]
    );

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: "Row not found during delete" });
    }

    // Step 3: Update serial numbers of remaining rows
    await connection.query(
      `UPDATE \`${tableName}\` SET serial_number = serial_number - 1 WHERE serial_number > ?`,
      [deletedSerial]
    );

    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Delete row error:", error);
    res.status(500).json({ success: false, error: "Failed to delete row" });
  } finally {
    connection.release();
  }
};
// Mark a file as deleted and drop the corresponding column from the table

exports.markFileAsDeleted = async (req, res) => {
  const file = req.body;

  if (!file || !file.id || !file.setting_id || !file.name) {
    return res.status(400).json({ success: false, error: "Missing required file info" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Step 1: Delete from setfile table
    await connection.query("DELETE FROM setfile WHERE id = ?", [file.id]);

    // Step 2: Get row from setting table
    const [settingRows] = await connection.query("SELECT * FROM setting WHERE id = ?", [file.setting_id]);
    if (settingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, error: "Setting not found" });
    }

    const setting = settingRows[0];
    const tableName = setting.table_name; // assumed to be table name

    // Step 3: Alter table to drop the column
    const columnToDelete = file.name; // e.g., A01
    const dropQuery = `ALTER TABLE \`${tableName}\` DROP COLUMN \`${columnToDelete}\``;

    await connection.query(dropQuery);

    await connection.commit();
    res.json({ success: true, message: "File deleted and column dropped", table: tableName, column: columnToDelete });

  } catch (error) {
    await connection.rollback();
    console.error("Error in markFileAsDeleted:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  } finally {
    connection.release();
  }
};
exports.updateSelectedMV = async (req, res) => {
  const { file_id, selectedmv, selectedCustomer, selectedIndexes } = req.body;
  console.log("Received request to update selectedmv:", req.body);

  if (!file_id || selectedmv === undefined || selectedCustomer === "" || !Array.isArray(selectedIndexes)) {
    return res.status(400).json({ message: "file_id, selectedmv, selectedCustomer, and selectedIndexes are required" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //  Step 0: Lock customer, setfile, setting, and all related tables
    const [settingRows] = await connection.query(
      "SELECT table_name FROM setting WHERE customer_id = ?",
      [selectedCustomer]
    );

    const tableNames = settingRows.map(row => row.table_name);
    const tablesToLock = [
      "customer WRITE",
      "setfile WRITE",
      "setting WRITE",
      ...tableNames.map(name => `${connection.escapeId(name)} WRITE`)
    ].join(", ");

    await connection.query(`LOCK TABLES ${tablesToLock}`);

    // \U0001f539 Step 1: Fetch mvvariables AFTER locking
    const [customerRows] = await connection.query("SELECT mvvariables FROM customer WHERE id = ?", [selectedCustomer]);
    if (customerRows.length === 0) {
      await connection.rollback();
      await connection.query("UNLOCK TABLES");
      return res.status(404).json({ message: "Customer not found" });
    }

    const mvvariablesStr = customerRows[0].mvvariables;
    let uniqueArray1 = [];

    try {
      uniqueArray1 = JSON.parse(mvvariablesStr);
    } catch (parseErr) {
      await connection.rollback();
      await connection.query("UNLOCK TABLES");
      console.error("Error parsing mvvariables JSON:", parseErr);
      return res.status(500).json({ message: "Invalid mvvariables format in customer table" });
    }

    // \U0001f539 MV Templates (You need to fill this array)
    const mergedGroups = [ "//$MV4[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
      "//$MV4_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]",
      "//$MV4_Scramble[enable:[*SCRAMBLE_EN*]]",
      "//$MV4_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
      "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
      "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
      "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
      "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
      "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
      "//$MV4_Start[]",
      "//$MV6[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
      "//$MV6_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]",
      "//$MV6_Scramble[enable:[*SCRAMBLE_EN*]]",
      "//$MV6_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
      "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
      "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
      "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
      "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
      "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
      "//$MV6_Start[]"];

    // \U0001f539 Extract variables
    const combinedMVText = selectedIndexes.map(i => mergedGroups[i]).join("\n");
    const regex = /\[\*(.*?)\*\]/g;
    const uniqueVariablesFromMV = new Set();
    let match;
    while ((match = regex.exec(combinedMVText)) !== null) {
      uniqueVariablesFromMV.add(match[1]);
    }

    const mergedSet = new Set([...uniqueVariablesFromMV, ...uniqueArray1]);
    const mergedUniqueArray = [...mergedSet];
    const missingVariables = [...uniqueVariablesFromMV].filter(v => !uniqueArray1.includes(v));

    //  Step 6-7: Insert missing variables
    if (missingVariables.length > 0) {
      const startSerial = uniqueArray1.length + 1;

      for (const tableName of tableNames) {
        // Step 7a: Shift existing rows
        await connection.query(
          `UPDATE ?? SET serial_number = serial_number + ? WHERE serial_number >= ? ORDER BY serial_number DESC`,
          [tableName, missingVariables.length, startSerial]
        );

        // Step 7b: Insert new variables
        for (let i = 0; i < missingVariables.length; i++) {
          const serial_number = startSerial + i;
          const variable = missingVariables[i];
          await connection.query(
            `INSERT INTO ?? (serial_number, Tunning_param) VALUES (?, ?)`,
            [tableName, serial_number, variable]
          );
        }
      }

      //  Step 8: Update mvvariables
      await connection.query(
        `UPDATE customer SET mvvariables = ? WHERE id = ?`,
        [JSON.stringify(mergedUniqueArray), selectedCustomer]
      );
    }

    // Step 9: Update selectedmv in setfile
    const [result] = await connection.query(
      "UPDATE setfile SET selectedmv = ? WHERE id = ?",
      [selectedmv, file_id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      await connection.query("UNLOCK TABLES");
      return res.status(404).json({ message: "File not found" });
    }

    // Commit and unlock
    await connection.commit();
    await connection.query("UNLOCK TABLES");

    res.json({ message: "selectedmv updated successfully", mergedUniqueArray });
  } catch (error) {
    await connection.rollback();
    await connection.query("UNLOCK TABLES");
    console.error("Database error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

exports.clonesetfile = async (req, res) => {
  const { tableName, setfilePrefix, existingcolumnName } = req.body;

 

  const client = await pool.getConnection();

  try {
    // Check if column already exists
    const [columns] = await client.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, setfilePrefix]
    );

    if (columns.length > 0) {
      return res.status(400).json({ success: false, message: `Column '${setfilePrefix}' already exists in table '${tableName}'.` });
    }

    await client.query(`BEGIN`);

    // Add new column
    await client.query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${setfilePrefix}\` VARCHAR(255) DEFAULT NULL`
    );

    // Copy values
    await client.query(
      `UPDATE \`${tableName}\` SET \`${setfilePrefix}\` = \`${existingcolumnName}\``
    );

    await client.query(`COMMIT`);
    return res.json({ success: true });

  } catch (e) {
    await client.query(`ROLLBACK`);
    console.error("Error in clonesetfile:", e);
    return res.status(500).json({ success: false, message: "Internal Server Error" });

  } finally {
    client.release();
  }
};

exports.addSetfile = async (req, res) => {
  const { mode_id, setting_id, setfilePrefix, generatedSetfileName, selectedmv } = req.body;

  const client = await pool.getConnection();
  try {
    await client.query(`BEGIN`);

    // Insert into setfile table
    const [result] = await client.query(
      `INSERT INTO setfile (mode_id, setting_id, name, full_name, selectedmv) VALUES (?, ?, ?, ?, ?)`,
      [mode_id, setting_id, setfilePrefix, generatedSetfileName, selectedmv]
    );

    const insertedId = result.insertId;

    // Fetch inserted row
    const [rows] = await client.query(
      "SELECT * FROM setfile WHERE id = ?",
      [insertedId]
    );
    console.log("Inserted row:", rows);
    await client.query(`COMMIT`);

    if (rows.length > 0) {
      return res.json({ success: true, files: rows });
    } else {
      return res.status(404).json({ success: false, message: "No files found after insert" });
    }

  } catch (e) {
    await client.query(`ROLLBACK`);
    console.error("Error in addSetfile:", e);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    client.release();
  }
};
