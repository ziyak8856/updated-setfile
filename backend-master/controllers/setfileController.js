const pool = require("../config/db");
const path = require("path");
const fs = require("fs");
const pathd="C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"
const ROOT_DIR = "C:\\Users\\DELL\\Desktop\\SETFILE__2.0";
const UPLOAD_DIR = "C:\\Users\\DELL\\Desktop\\SETFILE__2.0\\PROJECTS";
const DUMP_DIR = "C:\\Users\\DELL\\Desktop\\SETFILE__2.0\\DATABASE";
const DB_NAME = "setfile_manager";
const DB_USER = "root";
const DB_PASS = "Ziya@8856";
const { exec } = require("child_process");
const mergedGroups = [ 
  "//$MV4[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
  "//$MV4_Sensor[fps:[*FPS*]]",
  "//$MV4_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]]",
  "//$MV4_Scramble[enable:[*SCRAMBLE_EN*]]",
  "//$MV4_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
  "//$MV4_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
  "//$MV4_SFR[address:[*SFR_ADDRESS_1*],data:[*SFR_DATA_1*]]",
  "//$MV4_SFR[address:[*SFR_ADDRESS_2*],data:[*SFR_DATA_2*]]",
  "//$MV4_SFR[address:[*SFR_ADDRESS_3*],data:[*SFR_DATA_3*]]",
  "//$MV4_SFR[address:[*SFR_ADDRESS_4*],data:[*SFR_DATA_4*]]",
  "//$MV4_SFR[address:[*SFR_ADDRESS_5*],data:[*SFR_DATA_5*]]",
  "//$MV4_SFR[address:[*SFR_ADDRESS_6*],data:[*SFR_DATA_6*]]",
  "//$MV4_SFR[address:[*SFR_ADDRESS_7*],data:[*SFR_DATA_7*]]",
  "//$MV4_Start[]",

  "//$MV6[MCLK:[*MCLK*],mipi_phy_type:[*PHY_TYPE*],mipi_lane:[*PHY_LANE*],mipi_datarate:[*MIPI_DATA_RATE*]]",
  "//$MV6_Sensor[fps:[*FPS*]]",
  "//$MV6_CPHY_LRTE[enable:[*LRTE_EN*],longPacketSpace:2,shortPacketSpace:2]]",
  "//$MV6_Scramble[enable:[*SCRAMBLE_EN*]]",
  "//$MV6_MainData[width:[*WIDTH*],height:[*HEIGHT*],data_type:[*DATA_TYPE*],virtual_channel:[*MAIN_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED_LCG*],width:[*ILD_WIDTH_LCG*],height:[*ILD_HEIGHT_LCG*],data_type:[*DATA_TYPE*],virtual_channel:[*ILD_LCG_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED1*],width:[*ILD_WIDTH1*],height:[*ILD_HEIGHT1*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD1_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_IS_USED2*],width:[*ILD_WIDTH2*],height:[*ILD_HEIGHT2*],data_type:MIPI_RAW10 (0x2B),virtual_channel:[*ILD2_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED3*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT3*],data_type:Embedded_Data (0x12),virtual_channel:[*ILD3_ELG_VC*]]",
  "//$MV6_InterleavedData[isUsed:[*ILD_ELG_IS_USED4*],width:[*WIDTH*],height:[*ILD_ELG_HEIGHT4*],data_type:User_Defined_1 (0x30),virtual_channel:[*ILD4_ELG_VC*]]",
  "//$MV6_SFR[address:[*SFR_ADDRESS_1*],data:[*SFR_DATA_1*]]",
  "//$MV6_SFR[address:[*SFR_ADDRESS_2*],data:[*SFR_DATA_2*]]",
  "//$MV6_SFR[address:[*SFR_ADDRESS_3*],data:[*SFR_DATA_3*]]",
  "//$MV6_SFR[address:[*SFR_ADDRESS_4*],data:[*SFR_DATA_4*]]",
  "//$MV6_SFR[address:[*SFR_ADDRESS_5*],data:[*SFR_DATA_5*]]",
  "//$MV6_SFR[address:[*SFR_ADDRESS_6*],data:[*SFR_DATA_6*]]",
  "//$MV6_SFR[address:[*SFR_ADDRESS_7*],data:[*SFR_DATA_7*]]",
  "//$MV6_Start[]"
];

const runDump = (tableName, outputPath) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${pathd}" --skip-extended-insert -u ${DB_USER} -p${DB_PASS} ${DB_NAME} ${tableName} > "${outputPath}"`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`mysqldump error for table ${tableName}:`, error);
        return reject(error);
      }
      console.log(`✅ Dumped table ${tableName} to ${outputPath}`);
      resolve();
    });
  });
};
const commitAndPushToGit = () => {
    return new Promise((resolve, reject) => {
      // Step 1: git add .
      exec(`git -C "${ROOT_DIR}" add .`, (err) => {
        if (err) {
          console.error("❌ Git add failed:", err);
          return reject(err);
        }
  
        // Step 2: check if there are any staged changes
        exec(`git -C "${ROOT_DIR}" diff --cached --quiet`, (err) => {
          if (!err) {
            console.log("ℹ️ Nothing to commit. Working tree clean.");
            return resolve(); // Exit early — nothing to commit
          }
  
          // Step 3: commit and push if there are changes
          exec(`git -C "${ROOT_DIR}" commit -m "Created project with all related tables"`, (err) => {
            if (err) {
              console.error("❌ Git commit failed:", err);
              return reject(err);
            }
  
            exec(`git -C "${ROOT_DIR}" push`, (err) => {
              if (err) {
                console.error("❌ Git push failed:", err);
                return reject(err);
              }
  
              console.log("✅ Git commit and push completed successfully.");
              resolve();
            });
          });
        });
      });
    });
  };

// Fetch all setfiles for a given mode_id
exports.getSetFiles = async (req, res) => {
  const { mode_id,table_id } = req.query;

  if (!mode_id||!table_id) {
    return res.status(400).json({ message: "mode_id or table_id is  required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM setfile WHERE mode_id = ? and setting_id=? ",
      [mode_id,table_id]
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

exports.FileDatatableSaveall= async (req, res) => {
  const {updates,deletions,insertions,projectName,customerName,selectedMkclTable ,mvvariables} = req.body; // Expecting an array of updates
 // console.log("Received batch update request:", updates);
  const insertedResults = [];
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
   
    const [rows] = await connection.query("SELECT * FROM setting WHERE id = ?", [selectedMkclTable]); // Use `.promise()` for async/await
    
    const tablenameFromsetting= rows[0].table_name ;
    const settingFolderFromsetting= rows[0].name ;
    const [setfilerows] = await connection.query(
      "SELECT * FROM setfile WHERE setting_id=? ",
      [selectedMkclTable]
    );
   // console.log(setfilerows);
   const setfilemap={}
   for(const setfiler of setfilerows){
    const {name,full_name,selectedmv}=setfiler;
    setfilemap[name]={full_name,selectedmv};
   }
  
  // console.log(JSON.stringify(setfilemap))
     
    if(updates.length!=0){
    for (const update of updates) {
      const { tableName, rowId, colName, value, regmapEntry } = update;

      // If the column is "Tunning_param" and regmap exists, update all relevant fields
      if (colName === "Tunning_param" && regmapEntry !== undefined) {
        const [columnsResult] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
        const allColumns = columnsResult.map(col => col.Field);

        const columnsToUpdate = allColumns.filter(col =>
          !["id", "serial_number", "Tunning_param"].includes(col)
        );
        const updateFields = ["`Tunning_param` = ?"];
        const updateValues = [value];
        for (const col of columnsToUpdate) {
          updateFields.push(`\`${col}\` = ?`);
          updateValues.push(regmapEntry);
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
  }
    if(deletions.length!=0){
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
    }
    if(insertions.length!=0){
    for (const insertion of insertions) {
      const { tableName, refId, position, data, setting_id, tempId,defaultValue } = insertion;
      console.log(defaultValue)
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
        rowToInsert[col] = data[col] !== undefined ? data[col] : defaultValue;
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
    }
    const [tabledatafull] = await connection.query(
      `SELECT * FROM \`${tablenameFromsetting}\` ORDER BY serial_number ASC`
    );
    console.log(tabledatafull)
    const finalRowData = {};
    tabledatafull.forEach(col => {
      Object.keys(col).forEach(key => {
        if (key !== "id" && key !== "serial_number"&& key !== "Tunning_param") {
          let keyoffile = col["Tunning_param"];
          let val = col[key];
          if ((keyoffile.startsWith("//")))val=null;
          if (!finalRowData[key]) {
            finalRowData[key] = {};
          }
          // Push the new value into the array
          finalRowData[key][keyoffile]=val;
        }
      });
    });
   console.log(finalRowData);
    for (const key in finalRowData) {
     // console.log(setfilemap[key])
      const indexes =setfilemap[key].selectedmv
      .split(",")
      .map((i) => parseInt(i.trim()))
      .filter((i) => !isNaN(i));
      const combinedMVText = indexes
      .map(i => mergedGroups[i])
      .join("\n");
      const regex = /\[\*(.*?)\*\]/g;
      const uniqueVariables = new Set(mvvariables);
      let match;
      //console.log(uniqueVariables)
      function replacePlaceholders(text, json) {
          return text.replace(/\[\*(.*?)\*\]/g, (match, varName) => json[varName] || match);
        }
        const perfile=finalRowData[key];
        const replacedText = replacePlaceholders(combinedMVText, perfile);
       // console.log(replacedText)
      let actualtext="\n";
      for(const key in perfile){
        if(uniqueVariables.has(key))continue;
        if(perfile[key]||(!key.startsWith("//")))
        actualtext+="WRITE"+"  #"+key+"      "+perfile[key]+"\n";
        else
        actualtext+="\n"+key+"\n";
    }
    //console.log("acc",actualtext)
   const dataToWrite = replacedText+"\n"+actualtext;
  
   const f_name=setfilemap[key].full_name;
   const fileLoction=path.join(UPLOAD_DIR,projectName,customerName,settingFolderFromsetting,f_name);
    console.log(fileLoction);
   
       fs.writeFile(fileLoction,dataToWrite,'utf8',(err)=>{
        if(err){
          console.log("lll",err);
        }else {
          console.log("done")
        }
       })
    
   // Free up memory
    }
    await connection.commit();
      // SQL Dumps
      try {
        await runDump(tablenameFromsetting, path.join(DUMP_DIR, `${tablenameFromsetting}.sql`));
        console.log("✅ All dumps completed successfully.");
      } catch (error) {
        console.error("❌ Error during dumping tables:", error);
      }
    // Git push
    await commitAndPushToGit()
  .then(() => console.log("✅Done"))
  .catch(err => console.error("Error:", err));
     res.json({ success: true, newRows: insertedResults });
  } catch (error) {
    await connection.rollback();
    console.error("Batch update error:", error);
    res.status(500).json({ error: "Failed to apply batch updates" });
  } finally {
    connection.release();
  }
};
exports.CloneFileFromsame = async (req, res) => {
  const { mode_id, setting_id, setfilePrefix, generatedSetfileName, selectedmv ,updates,deletions,insertions,projectName,customerName ,mvvariables, tableName, existingcolumnName } = req.body;
  const insertedResults = [];
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    // adding to db step1
     // Check if column already exists
     const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [tableName, setfilePrefix]
    );
    if (columns.length > 0) {
      return res.status(400).json({ success: false, message: `Column '${setfilePrefix}' already exists in table '${tableName}'.` });
    }
    // Add new column
    await connection.query(
      `ALTER TABLE \`${tableName}\` ADD COLUMN \`${setfilePrefix}\` VARCHAR(255) DEFAULT NULL`
    );
    // Copy values
    await connection.query(
      `UPDATE \`${tableName}\` SET \`${setfilePrefix}\` = \`${existingcolumnName}\``
    );



    // updating setting table step2 
     await connection.query(
      `INSERT INTO setfile (mode_id, setting_id, name, full_name, selectedmv) VALUES (?, ?, ?, ?, ?)`,
      [mode_id, setting_id, setfilePrefix, generatedSetfileName, selectedmv]
    );
     

    //now update delete add step3
    const [rows] = await connection.query("SELECT * FROM setting WHERE id = ?", [setting_id]); // Use `.promise()` for async/await
    
    const tablenameFromsetting= rows[0].table_name ;
    const settingFolderFromsetting= rows[0].name ;
    const [setfilerows] = await connection.query(
      "SELECT * FROM setfile WHERE setting_id=? ",
      [setting_id]
    );
   // console.log(setfilerows);
   const setfilemap={}
   for(const setfiler of setfilerows){
    const {name,full_name,selectedmv}=setfiler;
    setfilemap[name]={full_name,selectedmv};
   }
  
  // console.log(JSON.stringify(setfilemap))
     //start from here we have problem in colname
    if(updates.length!=0){
    for (const update of updates) {
      const { tableName, rowId, colName, value, regmapEntry } = update;
      console.log(update)
      // If the column is "Tunning_param" and regmap exists, update all relevant fields
      if (colName === "Tunning_param" && regmapEntry !== undefined) {
        const [columnsResult] = await connection.query(`SHOW COLUMNS FROM \`${tableName}\``);
        const allColumns = columnsResult.map(col => col.Field);

        const columnsToUpdate = allColumns.filter(col =>
          !["id", "serial_number", "Tunning_param"].includes(col)
        );
        const updateFields = ["`Tunning_param` = ?"];
        const updateValues = [value];
        for (const col of columnsToUpdate) {
          updateFields.push(`\`${col}\` = ?`);
          updateValues.push(regmapEntry);
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
  }
    if(deletions.length!=0){
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
    }
    if(insertions.length!=0){
    for (const insertion of insertions) {
      const { tableName, refId, position, data, setting_id, tempId,defaultValue } = insertion;
      console.log(defaultValue)
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
        rowToInsert[col] = data[col] !== undefined ? data[col] : defaultValue;
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
    }
    const [tabledatafull] = await connection.query(
      `SELECT * FROM \`${tablenameFromsetting}\` ORDER BY serial_number ASC`
    );
    await connection.commit();
    console.log(tabledatafull)
    const finalRowData = {};
    tabledatafull.forEach(col => {
      Object.keys(col).forEach(key => {
        if (key !== "id" && key !== "serial_number"&& key !== "Tunning_param") {
          let keyoffile = col["Tunning_param"];
          let val = col[key];
          if ((keyoffile.startsWith("//")))val=null;
          if (!finalRowData[key]) {
            finalRowData[key] = {};
          }
          // Push the new value into the array
          finalRowData[key][keyoffile]=val;
        }
      });
    });
   console.log(finalRowData);
    for (const key in finalRowData) {
     // console.log(setfilemap[key])
      const indexes =setfilemap[key].selectedmv
      .split(",")
      .map((i) => parseInt(i.trim()))
      .filter((i) => !isNaN(i));
      const combinedMVText = indexes
      .map(i => mergedGroups[i])
      .join("\n");
      const regex = /\[\*(.*?)\*\]/g;
      const uniqueVariables = new Set(mvvariables);
      let match;
      //console.log(uniqueVariables)
      function replacePlaceholders(text, json) {
          return text.replace(/\[\*(.*?)\*\]/g, (match, varName) => json[varName] || match);
        }
        const perfile=finalRowData[key];
        const replacedText = replacePlaceholders(combinedMVText, perfile);
       // console.log(replacedText)
      let actualtext="\n";
      for(const key in perfile){
        if(uniqueVariables.has(key))continue;
        if(perfile[key]||(!key.startsWith("\\")))
        actualtext+="WRITE"+"  #"+key+"      "+perfile[key]+"\n";
        else
        actualtext+="\n"+key+"\n";
    }
    //console.log("acc",actualtext)
   const dataToWrite = replacedText+"\n"+actualtext;
  
   const f_name=setfilemap[key].full_name;
   const fileLoction=path.join(UPLOAD_DIR,projectName,customerName,settingFolderFromsetting,f_name);
    console.log(fileLoction);
   
       fs.writeFile(fileLoction,dataToWrite,'utf8',(err)=>{
        if(err){
          console.log("lll",err);
        }else {
          console.log("done")
        }
       })
    
   // Free up memory
    }
   
      // SQL Dumps
      try {
        await runDump(tablenameFromsetting, path.join(DUMP_DIR, `${tablenameFromsetting}.sql`));
        await runDump("setfile", path.join(DUMP_DIR, `setfile.sql`));
        console.log("✅ All dumps completed successfully.");
      } catch (error) {
        console.error("❌ Error during dumping tables:", error);
      }
    // Git push
    await commitAndPushToGit()
  .then(() => console.log("✅Done"))
  .catch(err => console.error("Error:", err)); 
    res.json({ success: true, newRows: insertedResults });
  } catch (e) {
    await connection.rollback();
    console.error("Error in addSetfile:", e);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};

exports.cloneFromAny = async (req, res) => {
  const{selectedCustomer,selectedIndexes,table_Nametoupdate,tableData,setfilePrefix,mode_id, setting_id, generatedSetfileName, selectedmv,projectName}=req.body;
  // console.log(req.body)
  let m=0;
  let n=0;
  if (selectedCustomer === "" || !Array.isArray(selectedIndexes)||!tableData || !table_Nametoupdate || !setfilePrefix) {
    return res.status(400).json({ message: "file_id, selectedmv, selectedCustomer, and selectedIndexes are required" });
  }
  console.log("frrrr",selectedCustomer,selectedIndexes);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    //  Step 0: Lock customer, setfile, setting, and all related tables
    const [settingRows] = await connection.query(
      "SELECT table_name FROM setting WHERE customer_id = ?",
      [selectedCustomer]
    );
    const tableNames = settingRows.map(row => row.table_name);
    // \U0001f539 Step 1: Fetch mvvariables AFTER locking
    const [customerRows] = await connection.query("SELECT * FROM customer WHERE id = ?", [selectedCustomer]);
    if (customerRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Customer not found" });
    }

    const mvvariablesStr = customerRows[0].mvvariables;
    const customerName=customerRows[0].name;
    let uniqueArray1 = [];


      uniqueArray1 = JSON.parse(mvvariablesStr);
    
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
    
    // \U0001f539 Step 6-7: Insert missing variables
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
          console.log("rooooo",serial_number,variable)
          await connection.query(
            `INSERT INTO ?? (serial_number, Tunning_param) VALUES (?, ?)`,
            [tableName, serial_number, variable]
          );
        }
      }

      // \U0001f539 Step 8: Update mvvariables
      await connection.query(
        `UPDATE customer SET mvvariables = ? WHERE id = ?`,
        [JSON.stringify(mergedUniqueArray), selectedCustomer]
      );
    }
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
      [table_Nametoupdate, setfilePrefix]
    );

    if (columns.length > 0) {
      return res.status(400).json({ success: false, message: `Column '${setfilePrefix}' already exists in table '${table_Nametoupdate}'.` });
    }
    // Add new column
    await connection.query(
      `ALTER TABLE \`${table_Nametoupdate}\` ADD COLUMN \`${setfilePrefix}\` VARCHAR(255) DEFAULT NULL`
    );
    // Commit and unlock
    
      const [rows] = await connection.query(
        `SELECT MAX(serial_number) AS maxSerial FROM ??`,
        [table_Nametoupdate]
      );
      const [columnsInfo] = await pool.query(`SHOW COLUMNS FROM \`${table_Nametoupdate}\``);
      const allColumns = columnsInfo.map(col => col.Field);
      let nextSerial = (rows[0]?.maxSerial || 0) + 1;
      n=nextSerial;
      m=nextSerial;
      for (const row of tableData) {
        const { Tunning_param, defaultparamValue,value} = row;
  
        if (!Tunning_param) continue;
  
        // Check if the row exists
        const [existing] = await connection.query(
          `SELECT * FROM ?? WHERE Tunning_param = ?`,
          [table_Nametoupdate, Tunning_param]
        );
  
        if (existing.length > 0) {
          // UPDATE if exists
         // console.log(Tunning_param);
          const updateSql = `UPDATE ?? SET ?? = ? WHERE Tunning_param = ?`;
          const updateValues = [table_Nametoupdate, setfilePrefix, value, Tunning_param];
          await connection.query(updateSql, updateValues);
        } else {
          // INSERT if not exists
        
          const newRow = {};
          for (const col of allColumns) {
            if (col === 'id' || col === 'serial_number'||col==='Tunning_param') continue;
            newRow[col] = col===`${setfilePrefix}` ? value : defaultparamValue;
          }
         // console.log(newRow)
          // Step 6: Generate insert query
          const insertCols = Object.keys(newRow).map(col => `\`${col}\``).join(", ");
          const insertVals = Object.values(newRow);
          const placeholders = insertVals.map(() => "?").join(", ");
          const [insertResult] = await connection.query(
            `INSERT INTO \`${table_Nametoupdate}\` (${insertCols}, serial_number,Tunning_param) VALUES (${placeholders}, ?,?)`,
            [...insertVals, nextSerial,Tunning_param]
          );
          nextSerial++;
          n=nextSerial;
        }
      }
     
      const [result] = await connection.query(
        `INSERT INTO setfile (mode_id, setting_id, name, full_name, selectedmv) VALUES (?, ?, ?, ?, ?)`,
        [mode_id, setting_id, setfilePrefix, generatedSetfileName, selectedmv]
      );
      const [rowsset] = await connection.query("SELECT * FROM setting WHERE id = ?", [setting_id]); // Use `.promise()` for async/await
    
    const tablenameFromsetting= rowsset[0].table_name ;
    const settingFolderFromsetting= rowsset[0].name ;
    const [setfilerows] = await connection.query(
      "SELECT * FROM setfile WHERE setting_id=? ",
      [setting_id]
    );
   // console.log(setfilerows);
   const setfilemap={}
   for(const setfiler of setfilerows){
    const {name,full_name,selectedmv}=setfiler;
    setfilemap[name]={full_name,selectedmv};
   }
      const [tabledatafull] = await connection.query(
        `SELECT * FROM \`${tablenameFromsetting}\` ORDER BY serial_number ASC`
      );
    await connection.commit();
    console.log(tabledatafull)
    const finalRowData = {};
    tabledatafull.forEach(col => {
      Object.keys(col).forEach(key => {
        if (key !== "id" && key !== "serial_number"&& key !== "Tunning_param") {
          let keyoffile = col["Tunning_param"];
          let val = col[key];
          if ((keyoffile.startsWith("//")))val=null;
          if (!finalRowData[key]) {
            finalRowData[key] = {};
          }
          // Push the new value into the array
          finalRowData[key][keyoffile]=val;
        }
      });
    });
   console.log(finalRowData);
    for (const key in finalRowData) {
     // console.log(setfilemap[key])
      const indexes =setfilemap[key].selectedmv
      .split(",")
      .map((i) => parseInt(i.trim()))
      .filter((i) => !isNaN(i));
      const combinedMVText = indexes
      .map(i => mergedGroups[i])
      .join("\n");
      const regex = /\[\*(.*?)\*\]/g;
      const uniqueVariables =mergedSet;
      let match;
      //console.log(uniqueVariables)
      function replacePlaceholders(text, json) {
          return text.replace(/\[\*(.*?)\*\]/g, (match, varName) => json[varName] || match);
        }
        const perfile=finalRowData[key];
        const replacedText = replacePlaceholders(combinedMVText, perfile);
       // console.log(replacedText)
      let actualtext="\n";
      for(const key in perfile){
        if(uniqueVariables.has(key))continue;
        if(perfile[key]||(!key.startsWith("//")))
        actualtext+="WRITE"+"  #"+key+"      "+perfile[key]+"\n";
        else
        actualtext+="\n"+key+"\n";
    }
    //console.log("acc",actualtext)
   const dataToWrite = replacedText+"\n"+actualtext;
  
   const f_name=setfilemap[key].full_name;
   const fileLoction=path.join(UPLOAD_DIR,projectName,customerName,settingFolderFromsetting,f_name);
    console.log(fileLoction);
   
       fs.writeFile(fileLoction,dataToWrite,'utf8',(err)=>{
        if(err){
          console.log("lll",err);
        }else {
          console.log("done")
        }
       })
    
   // Free up memory
    }
   
      // SQL Dumps
      try {
        await runDump("customer", path.join(DUMP_DIR, `customer.sql`));
        await runDump("setfile", path.join(DUMP_DIR, `setfile.sql`));
        for (const tableName of tableNames) {
          await runDump(tableName,path.join(DUMP_DIR,`${tableName}.sql`));
        }
        console.log("✅ All dumps completed successfully.");
      } catch (error) {
        console.error("❌ Error during dumping tables:", error);
      }
    // Git push
    await commitAndPushToGit()
  .then(() => console.log("✅Done"))
  .catch(err => console.error("Error:", err)); 

    res.json({ message:`${n-m} new tunning addes from ${m} to ${n-1} serial no in end of setfile table`, mergedUniqueArray });
  } catch (error) {
    await connection.rollback();
    console.error("Database error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};

// Mark a file as deleted and drop the corresponding column from the table

exports.markFileAsDeleted = async (req, res) => {
  const {file,projectName,customerName} = req.body;

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
    
   const fileLoction=path.join(UPLOAD_DIR,projectName,customerName,setting.name,file.full_name);
    console.log(fileLoction);
    fs.rm(fileLoction,(err)=>{
      if(err){
        console.log("lll",err);
      }else {
        console.log("done")
      }
     });
   

    try {
      await runDump(`${tableName}`, path.join(DUMP_DIR, `${tableName}.sql`));
      await runDump("setfile", path.join(DUMP_DIR, `setfile.sql`));
      
      console.log("✅ All dumps completed successfully.");
    } catch (error) {
      console.error("❌ Error during dumping tables:", error);
    }
  // Git push
  await commitAndPushToGit()
.then(() => console.log("✅Done"))
.catch(err => console.error("Error:", err)); 
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
   

    // \U0001f539 Step 1: Fetch mvvariables AFTER locking
    const [customerRows] = await connection.query("SELECT * FROM customer WHERE id = ?", [selectedCustomer]);
    if (customerRows.length === 0) {
      await connection.rollback();
   //   await connection.query("UNLOCK TABLES");
      return res.status(404).json({ message: "Customer not found" });
    }

    const mvvariablesStr = customerRows[0].mvvariables;
    const customerName=customerRows[0].name;
    let uniqueArray1 = [];

    try {
      uniqueArray1 = JSON.parse(mvvariablesStr);
    } catch (parseErr) {
      await connection.rollback();
     // await connection.query("UNLOCK TABLES");
      console.error("Error parsing mvvariables JSON:", parseErr);
      return res.status(500).json({ message: "Invalid mvvariables format in customer table" });
    }

    // \U0001f539 MV Templates (You need to fill this array)
   
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

    // \U0001f539 Step 6-7: Insert missing variables
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

      // \U0001f539 Step 8: Update mvvariables
      await connection.query(
        `UPDATE customer SET mvvariables = ? WHERE id = ?`,
        [JSON.stringify(mergedUniqueArray), selectedCustomer]
      );
    }

    // \U0001f539 Step 9: Update selectedmv in setfile
    await connection.query(
      "UPDATE setfile SET selectedmv = ? WHERE id = ?",
      [selectedmv, file_id]
    );

    await connection.commit();
    try {
       await runDump("customer",path.join(DUMP_DIR,`customer.sql`));
       await runDump("setfile",path.join(DUMP_DIR,`setfile.sql`));

      for (const tableName of tableNames) {
        await runDump(tableName, path.join(DUMP_DIR, `${tableName}.sql`));
      }
      console.log("✅ All dumps completed successfully.");
    } catch (error) {
      console.error("❌ Error during dumping tables:", error);
    }
  // Git push
  await commitAndPushToGit()
.then(() => console.log("✅Done"))
.catch(err => console.error("Error:", err)); 
    // Commit and unlock
  
    res.json({ message: "selectedmv updated successfully", mergedUniqueArray });
  } catch (error) {
    await connection.rollback();
    
    console.error("Database error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    connection.release();
  }
};
exports.fetchTableDataFornew = async (req, res) => {
  const { tableName} = req.body; // Extract from request body

  console.log("Received request for table:", tableName);
  

  if (!tableName ) {
    return res.status(400).json({ error: "Missing table name or column name" });
  }

  try {
    const query = `
      SELECT id, serial_number, Tunning_param
      FROM \`${tableName}\` 
      ORDER BY serial_number ASC
    `;

    const [rows] = await pool.query(query);
    // console.log("Fetched rows:", rows); 
    res.json({ rows });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Database query failed" });
  }
};