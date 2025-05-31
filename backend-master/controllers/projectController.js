const pool = require("../config/db");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");



// Define upload directory
    const mergedGroups = [/* ... your MV4 and MV6 strings ... */
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
const ROOT_DIR = "C:\\Users\\DELL\\Desktop\\SETFILE__2.0";
const UPLOAD_DIR = "C:\\Users\\DELL\\Desktop\\SETFILE__2.0\\PROJECTS";
const DUMP_DIR = "C:\\Users\\DELL\\Desktop\\SETFILE__2.0\\DATABASE";
const pathd="C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe"
const DB_NAME = "setfile_manager";
const DB_USER = "root";
const DB_PASS = "Ziya@8856";
async function queryWithTimeout(conn, sql, timeoutMs) {
  return Promise.race([
    conn.query(sql),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout acquiring global read lock")), timeoutMs)
    ),
  ]);
}
// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// Create a new projectconst path = require("path");

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
      if (err) {
        console.error("❌ Git add failed:", err);
        return reject(err);
      }
      exec(`git -C "${ROOT_DIR}" commit -m "Created project  with all related tables"`, (err) => {
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
};

exports.createFullProject = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { Pname, interfaceType } = req.body;
    const customers = JSON.parse(req.body.customers);
    const selectedIndexes = JSON.parse(req.body.selectedIndexes);

    if (!Pname || !Array.isArray(customers) || customers.length === 0) {
      conn.release();
      return res.status(400).json({ message: "Invalid request data" });
    }

    const projectDir = path.join(UPLOAD_DIR, Pname);
    if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

    let regmapPath = "", regmapBinPath = "";
    if (req.files?.regmap) {
      const regmapFile = req.files.regmap;
      regmapPath = path.join(projectDir, regmapFile.name);
      await regmapFile.mv(regmapPath);
    }
    if (req.files?.regmapBin) {
      const regmapBinFile = req.files.regmapBin;
      regmapBinPath = path.join(projectDir, regmapBinFile.name);
      await regmapBinFile.mv(regmapBinPath);
    }

    const start_fname = "A000";
    await conn.beginTransaction();

    const [tables] = await conn.query(`SHOW TABLES LIKE 'project'`);
    if (tables.length === 0) {
      await conn.query("UNLOCK TABLES");
      await conn.rollback();
      conn.release();
      return res.status(400).json({ message: "project table does not exist" });
    }

    const insertProjectQuery = `
      INSERT INTO project (name, regmap_path, regmap_binpath, start_fname)
      VALUES (?, ?, ?, ?)
    `;
    const [projectResult] = await conn.query(insertProjectQuery, [Pname, regmapPath, regmapBinPath, start_fname]);
    const projectId = projectResult.insertId;

    const combinedMVText = selectedIndexes.map(i => mergedGroups[i]).join("\n");
    const regex = /\[\*(.*?)\*\]/g;
    const uniqueVariables = new Set();
    let match;
    while ((match = regex.exec(combinedMVText)) !== null) {
      uniqueVariables.add(match[1]);
    }

    const uniqueArray = [...uniqueVariables];
    const selectedmv = selectedIndexes.join(",");
    const mvvariables = JSON.stringify(uniqueArray);

    const customerQuery = "INSERT INTO customer (project_id, name, selectedmv, mvvariables) VALUES ?";
    const customerValues = customers.map(name => [projectId, name, selectedmv, mvvariables]);

    for (const customer of customers) {
      const cusDir = path.join(projectDir, customer);
      const setclkdir = path.join(cusDir, interfaceType);
      if (!fs.existsSync(setclkdir)) fs.mkdirSync(setclkdir, { recursive: true });
    }

    const [customerResult] = await conn.query(customerQuery, [customerValues]);
    const fetchCustomersQuery = `
      SELECT id, name FROM customer
      WHERE id >= ? AND id < ?
    `;
    const [newCustomers] = await conn.query(fetchCustomersQuery, [
      customerResult.insertId,
      customerResult.insertId + customerResult.affectedRows,
    ]);

    const settings = newCustomers.map(c => ({
      name: interfaceType,
      table_name: `${Pname}_${c.name}_${interfaceType}`,
      customer_id: c.id,
    }));

    const settingQuery = "INSERT INTO setting (customer_id, name, table_name) VALUES ?";
    const settingValues = settings.map(s => [s.customer_id, s.name, s.table_name]);

    const [settingResult] = await conn.query(settingQuery, [settingValues]);

    const settingSelectQuery = `
      SELECT id, table_name FROM setting
      WHERE id >= ? AND id < ?
    `;
    const [newSettings] = await conn.query(settingSelectQuery, [
      settingResult.insertId,
      settingResult.insertId + settingResult.affectedRows,
    ]);

    for (const { table_name } of newSettings) {
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS \`${table_name}\` (
          id INT AUTO_INCREMENT PRIMARY KEY,
          serial_number INT NOT NULL,
          Tunning_param VARCHAR(512) DEFAULT NULL
        )
      `;
      await conn.query(createTableQuery);
    }

    if (uniqueArray.length > 0) {
      for (const { table_name } of newSettings) {
        const insertParamsQuery = `INSERT INTO \`${table_name}\` (serial_number, Tunning_param) VALUES ?`;
        const values = uniqueArray.map((param, index) => [index + 1, param]);
        await conn.query(insertParamsQuery, [values]);
      }
    }

    await conn.query("UNLOCK TABLES");
    await conn.commit();

    // SQL Dumps
          try {
        await runDump("project", path.join(DUMP_DIR, `project.sql`));
        await runDump("customer", path.join(DUMP_DIR, `customer.sql`));
        await runDump("setting", path.join(DUMP_DIR, `setting.sql`));
        
        for (const { table_name } of newSettings) {
          await runDump(table_name, path.join(DUMP_DIR, `${table_name}.sql`));
        }
        console.log("✅ All dumps completed successfully.");
      } catch (error) {
        console.error("❌ Error during dumping tables:", error);
      }
    // Git push
   commitAndPushToGit()
  .then(() => console.log("Done"))
  .catch(err => console.error("Error:", err));

    res.json({ message: "Project created successfully", projectId });
  } catch (err) {
    try {
      await conn.query("UNLOCK TABLES");
    } catch (_) {}
    await conn.rollback();
    console.error("Error:", err.message);
    res.status(500).json({ message: "Error creating project", error: err.message });
  } finally {
    try {
      await conn.query("SELECT RELEASE_LOCK('project_creation_lock')");
    } catch (e) {
      console.error("Failed to release named lock:", e.message);
    }
    conn.release();
  }
};

exports.uploadRegmap = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { projectId, name } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ message: "Project ID and name are required" });
    }

    const projectDir = path.join(UPLOAD_DIR, name);
    if (!fs.existsSync(projectDir)) {
      return res.status(404).json({ message: "Project directory not found" });
    }

    let regmapPath = "";
    if (req.files && req.files.regmap) {
      const regmapFile = req.files.regmap;
      regmapPath = path.join(projectDir, regmapFile.name);

      // Overwrite existing file automatically
      await regmapFile.mv(regmapPath);
    } else {
      return res.status(400).json({ message: "No regmap file uploaded" });
    }

    // Start DB transaction
    await connection.beginTransaction();

    await connection.query(
      `UPDATE project SET regmap_path = ? WHERE id = ?`,
      [regmapPath, projectId]
    );

    await connection.commit();
    // Git push
   commitAndPushToGit()
  .then(() => console.log("Done"))
  .catch(err => console.error("Error:", err));
    res.json({
      message: "Regmap uploaded successfully",
      projectId,
      projectName: name,
      regmapPath,
    });

  } catch (err) {
    console.error("Error uploading regmap:", err);
    await connection.rollback();
    res.status(500).json({ message: "Internal server error", error: err.message });
  } finally {
    connection.release();
  }
};



// Get all projects
exports.getProjects = async (req, res) => {
  try {
    const [projects] = await pool.query("SELECT * FROM project");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
  }

  try {
      const query = `SELECT * FROM project WHERE id = ?`;
      const [rows] = await pool.query(query, [projectId]);

      if (rows.length === 0) {
          return res.status(404).json({ message: "Project not found" });
      }

      res.json(rows[0]); // Return the first project found
  } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({ message: "Database error", error: err.message });
  }
};


exports.getRegmap = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Get regmap path from DB
    const [rows] = await pool.query(`SELECT regmap_path FROM project WHERE id = ?`, [projectId]);

    if (!rows || rows.length === 0 || !rows[0].regmap_path) {
      return res.status(404).json({ message: "Regmap path not found in database" });
    }

    const regmapPath = rows[0].regmap_path;

    // Check if the file exists
    if (!fs.existsSync(regmapPath)) {
      return res.status(404).json({ message: "Regmap file not found on disk" });
    }

    // Send the file to the client
    return res.sendFile(path.resolve(regmapPath));

  } catch (err) {
    return res.status(500).json({ message: "Error fetching regmap", error: err.message });
  }
};