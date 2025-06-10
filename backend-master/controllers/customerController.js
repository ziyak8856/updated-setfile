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
// Add a new customer under a project
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
    exec(`git -C "${ROOT_DIR}" add .`, (err) => {
      if (err) return reject("Git add failed: " + err);

      exec(`git -C "${ROOT_DIR}" diff --cached --quiet`, (err) => {
        if (!err) {
          console.log("ℹ️ Nothing to commit.");
          return resolve(null); // No commit
        }

        exec(`git -C "${ROOT_DIR}" commit -m "Created project with all related tables"`, (err) => {
          if (err) return reject("Git commit failed: " + err);

          exec(`git -C "${ROOT_DIR}" rev-parse HEAD`, (err, stdout) => {
            if (err) return reject("Git rev-parse failed: " + err);
            const commitId = stdout.trim();
            console.log(commitId)

            exec(`git -C "${ROOT_DIR}" push`, (err) => {
              if (err) return reject("Git push failed: " + err);
              console.log("✅ Git commit and push completed.");
              resolve(commitId);
            });
          });
        });
      });
    });
  });
};
exports.addCustomers = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { projectId, customers, selectedIndexes, projectName } = req.body;
    console.log("customer routes", projectId, customers, selectedIndexes, projectName);

    // Validate input
    if (!projectId || !customers || !Array.isArray(customers) || customers.length === 0 || !projectName) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Ensure project directory exists
    const projectDir = path.join(UPLOAD_DIR, projectName);
    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    await conn.beginTransaction();

    // Prepare combined MV text and extract unique variables
    const combinedMVText = selectedIndexes
      .map(i => mergedGroups[i])
      .join("\n");

    const regex = /\[\*(.*?)\*\]/g;
    const uniqueVariables = new Set();
    let match;
    while ((match = regex.exec(combinedMVText)) !== null) {
      uniqueVariables.add(match[1]);
    }
    const uniqueArray = [...uniqueVariables];

    // Prepare values for insertion
    const selectedmv = selectedIndexes.join(",");
    const mvvariables = JSON.stringify(uniqueArray);

    // Create directories for each customer and prepare values array
    const values = customers.map(customer => {
      const cusDir = path.join(projectDir, customer);
      if (!fs.existsSync(cusDir)) {
        fs.mkdirSync(cusDir, { recursive: true });
      }
      return [projectId, customer, selectedmv, mvvariables];
    });

    // Insert customers into DB
    const query = "INSERT INTO customer (project_id, name, selectedmv, mvvariables) VALUES ?";
    const [result] = await conn.query(query, [values]);

    // Commit transaction on success
    await conn.commit();
    try {
           await runDump("customer", path.join(DUMP_DIR, `customer.sql`));
           console.log("✅ All dumps completed successfully.");
         } catch (error) {
           console.error("❌ Error during dumping tables:", error);
         }
       // Git push
       let iDc;
       await commitAndPushToGit()
     .then((commitId) => { iDc=commitId})
     .catch(err => console.error("Error:", err));
      
    res.json({ message: "Customers added successfully" });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    conn.release();
  }
};
// Get all customers under a specific project
exports.getCustomersByProject = async (req, res) => {
  try {
   // console.log("customer routes");
    const { projectId } = req.params;
   // console.log(projectId);
    const [customers] = await pool.query("SELECT * FROM customer WHERE project_id = ?", [projectId]);
   // console.log(customers);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
};
exports.getCustomerById = async (req, res) => {
  try {
    console.log("customer routes");
    const { customerId } = req.params;
    console.log(customerId);
    const [customer] = await pool.query("SELECT * FROM customer WHERE id = ?", [customerId]);

    if (customer.length === 0) {
      return res.status(404).json({ message: "Customer not found" });
    }
    console.log(customer)
    res.json(customer[0]);
  } catch (err) {
    console.error("Error fetching customer:", err);
    res.status(500).json({ message: "Database error", error: err.message });
  }
};
exports.updateMVHeaderForCustomer = async (req, res) => {
  const { customerId, selectedIndexes } = req.body;

  if (!customerId || !Array.isArray(selectedIndexes)) {
    return res.status(400).json({ message: "Invalid request data." });
  }
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Step 1: Fetch setting tables
    const [settingResult] = await connection.query(
      'SELECT id, table_name FROM setting WHERE customer_id = ?',
      [customerId]
    );

    const settingIds = settingResult.map(row => row.id);
    const uniqueTableNames = [...new Set(settingResult.map(row => row.table_name))];
    const tablestoDump = ["customer", "setfile"];

    // Step 2: Fetch customer data
    const [rows] = await connection.query(
      'SELECT selectedmv, mvvariables FROM customer WHERE id = ?',
      [customerId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customer = rows[0];
    const storedIndexes = customer.selectedmv
      ? customer.selectedmv.split(',').map(i => parseInt(i.trim(), 10))
      : [];
    const mvvariables = customer.mvvariables
      ? JSON.parse(customer.mvvariables)
      : [];

    const add = selectedIndexes.filter(index => !storedIndexes.includes(index));
    const remove = storedIndexes.filter(index => !selectedIndexes.includes(index));

    let setfileRows = [];

    // ---------- Remove Phase ----------
    if (remove.length > 0 && settingIds.length > 0) {
      const [setfileResults] = await connection.query(
        'SELECT id, selectedmv FROM setfile WHERE setting_id IN (?)',
        [settingIds]
      );

      setfileRows = setfileResults;

      for (const setfile of setfileRows) {
        const originalIndexes = setfile.selectedmv
          ? setfile.selectedmv.split(',').map(i => parseInt(i.trim(), 10))
          : [];

        const filteredIndexes = originalIndexes.filter(index => !remove.includes(index));
        const updatedIndexes = [...new Set(filteredIndexes)].join(',');

        await connection.query(
          'UPDATE setfile SET selectedmv = ? WHERE id = ?',
          [updatedIndexes, setfile.id]
        );
      }
    }

    // ---------- Add Phase ----------
    if (add.length > 0) {
      const combinedMVText = selectedIndexes.map(i => mergedGroups[i]).join("\n");
      const regex = /\[\*(.*?)\*\]/g;
      const uniqueVariablesFromMV = new Set();
      let match;

      while ((match = regex.exec(combinedMVText)) !== null) {
        uniqueVariablesFromMV.add(match[1]);
      }

      const missingVariables = [...uniqueVariablesFromMV].filter(
        variable => !mvvariables.includes(variable)
      );

      if (settingIds.length > 0) {
        const [setfileResults] = await connection.query(
          'SELECT id, selectedmv FROM setfile WHERE setting_id IN (?)',
          [settingIds]
        );

        setfileRows = setfileResults;

        for (const setfile of setfileRows) {
          const originalIndexes = setfile.selectedmv
            ? setfile.selectedmv.split(',').map(i => parseInt(i.trim(), 10))
            : [];

          const updatedIndexes = [...new Set([...originalIndexes, ...add])].join(',');

          await connection.query(
            'UPDATE setfile SET selectedmv = ? WHERE id = ?',
            [updatedIndexes, setfile.id]
          );
        }
      }

      if (missingVariables.length > 0) {
        const startSerial = mvvariables.length + 1;

        for (const tableName of uniqueTableNames) {
          await connection.query(
            `UPDATE ?? SET serial_number = serial_number + ? WHERE serial_number >= ? ORDER BY serial_number DESC`,
            [tableName, missingVariables.length, startSerial]
          );

          for (let i = 0; i < missingVariables.length; i++) {
            const serial_number = startSerial + i;
            const variable = missingVariables[i];

            await connection.query(
              `INSERT INTO ?? (serial_number, Tunning_param) VALUES (?, ?)`,
              [tableName, serial_number, variable]
            );
          }
          tablestoDump.push(tableName);
        }

        const mergedSet = new Set([...uniqueVariablesFromMV, ...mvvariables]);
        const mergedUniqueArray = [...mergedSet];

        await connection.query(
          'UPDATE customer SET mvvariables = ? WHERE id = ?',
          [JSON.stringify(mergedUniqueArray), customerId]
        );
      }
    }

    // ---------- Final Update ----------
    const updatedCustomerSelectedMV = selectedIndexes.join(',');
    await connection.query(
      'UPDATE customer SET selectedmv = ? WHERE id = ?',
      [updatedCustomerSelectedMV, customerId]
    );

    await connection.commit();
      try {
            for (const tableName of tablestoDump) {
              await runDump(tableName, path.join(DUMP_DIR, `${tableName}.sql`));
            }
            console.log("✅ All dumps completed successfully.");
          } catch (error) {
            console.error("❌ Error during dumping tables:", error);
          }
        // Git push
        let iDc;
        await commitAndPushToGit()
      .then((commitId) => { iDc=commitId})
      .catch(err => console.error("Error:", err));
    res.status(200).json({
      message: "MV header updated successfully.",
      storedVariableNames: mvvariables
    });

  } catch (error) {
    await connection.rollback();
    console.error("Error updating MV header:", error);
    res.status(500).json({ error: error.message || "Internal server error." });
  } finally {
    connection.release();
  }
};