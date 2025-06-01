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
  const insertions = req.body; // array of rows to insert
  if (!Array.isArray(insertions) || insertions.length === 0) {
    return res.status(400).json({ success: false, error: "No insertions provided" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const insertedResults = [];

    for (const insertion of insertions) {
      const { tableName, refId, position, data, setting_id, tempId } = insertion;

      // 1. Get serial_number of reference row
      const [refRows] = await connection.query(
        `SELECT serial_number FROM \`${tableName}\` WHERE id = ?`,
        [refId]
      );

      if (refRows.length === 0) {
        throw new Error(`Reference row not found in table ${tableName}`);
      }

      let newSerial = refRows[0].serial_number;
     // if (position === "below") newSerial += 1; // shift serials after ref if 'below'

      // 2. Shift existing rows' serial numbers
      await connection.query(
        `UPDATE \`${tableName}\` SET serial_number = serial_number + 1 WHERE serial_number >= ?`,
        [newSerial]
      );

      // 3. Fetch all column names
      const [columnsInfo] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
      const allColumns = columnsInfo.map(col => col.Field);

      // 4. Construct row to insert (merge data and default nulls)
      const rowToInsert = {};
      for (const col of allColumns) {
        if (["id", "serial_number"].includes(col)) continue;
        rowToInsert[col] = data[col] !== undefined ? data[col] : null;
      }

      const insertCols = Object.keys(rowToInsert).map(col => `\`${col}\``).join(", ");
      const insertVals = Object.values(rowToInsert);
      const placeholders = insertVals.map(() => "?").join(", ");

      // 5. Insert new row with computed serial
      const [insertResult] = await connection.query(
        `INSERT INTO \`${tableName}\` (${insertCols}, serial_number) VALUES (${placeholders}, ?)`,
        [...insertVals, newSerial]
      );

      // 6. Retrieve inserted row
      const [newRowData] = await connection.query(
        `SELECT * FROM \`${tableName}\` WHERE id = ?`,
        [insertResult.insertId]
      );

      insertedResults.push({
        newRow: newRowData[0],
        tempId,
        setting_id
      });
    }

    await connection.commit();
    res.json({ success: true, newRows: insertedResults });
  } catch (error) {
    await connection.rollback();
    console.error("Batch add rows error:", error);
    res.status(500).json({ success: false, error: "Failed to add one or more rows" });
  } finally {
    connection.release();
  }
};

exports.updateMultipleRows = async (req, res) => {
  const updates = req.body; // Expecting an array of updates
  console.log("Received batch update request:", updates);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const update of updates) {
      const { tableName, rowId, colName, value, regmap } = update;

      // If the column is "Tunning_param" and regmap exists, update all relevant fields
      if (colName === "Tunning_param" && regmap !== undefined) {
        const [columnsResult] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
        const allColumns = columnsResult.map(col => col.Field);

        const columnsToUpdate = allColumns.filter(col =>
          !["id", "serial_number", "Tunning_param"].includes(col)
        );

        const updateFields = ["`Tunning_param` = ?"];
        const updateValues = [value];

        for (const col of columnsToUpdate) {
          updateFields.push(`\`${col}\` = ?`);
          updateValues.push(regmap);
        }

        updateValues.push(rowId);

        await connection.query(
          `UPDATE \`${tableName}\` SET ${updateFields.join(", ")} WHERE id = ?`,
          updateValues
        );
      } else {
        // Normal column update
        await connection.query(
          `UPDATE \`${tableName}\` SET \`${colName}\` = ? WHERE id = ?`,
          [value, rowId]
        );
      }
    }

    await connection.commit();
    return res.json({ success: true, message: "All updates applied successfully." });
  } catch (error) {
    await connection.rollback();
    console.error("Batch update error:", error);
    return res.status(500).json({ error: "Failed to apply batch updates" });
  } finally {
    connection.release();
  }
};
// Assuming db.js is in the parent directory

exports.deleteallRow = async (req, res) => {
 const deletions = req.body; // [{ tableName, rowId }, ...]

  if (!Array.isArray(deletions) || deletions.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid or empty deletions array" });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const { tableName, rowId } of deletions) {
      if (!tableName || !rowId) {
        await connection.rollback();
        return res.status(400).json({ success: false, error: "Missing tableName or rowId in one of the deletions" });
      }

      // Step 1: Get serial_number of the row to delete
      const [rows] = await connection.query(
        `SELECT serial_number FROM \`${tableName}\` WHERE id = ?`,
        [rowId]
      );

      if (rows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: `Row with ID ${rowId} not found in ${tableName}` });
      }

      const deletedSerial = rows[0].serial_number;

      // Step 2: Delete the row
      const [deleteResult] = await connection.query(
        `DELETE FROM \`${tableName}\` WHERE id = ?`,
        [rowId]
      );

      if (deleteResult.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, error: `Failed to delete row with ID ${rowId}` });
      }

      // Step 3: Update serial_number for remaining rows
      await connection.query(
        `UPDATE \`${tableName}\` SET serial_number = serial_number - 1 WHERE serial_number > ?`,
        [deletedSerial]
      );
    }

    await connection.commit();
    return res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error("Batch delete error:", error);
    return res.status(500).json({ success: false, error: "Failed to delete rows" });
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

exports.cloneFromAny = async (req, res) => {
  const{tableName,setfilePrefix}=req.body;
  //updatemv header api take cus id selecteddmv and selected indexes
  //fill all data then do your filling od data
};