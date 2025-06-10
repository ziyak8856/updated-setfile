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
// Get all settings for a customer
exports.getSettingsByCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const query = "SELECT * FROM setting WHERE customer_id = ?";
    const [settings] = await pool.query(query, [customerId]);

    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
};
exports.getTableName = async (req, res) => {
  try {
    const { settingId } = req.params;

    if (!settingId) {
      return res.status(400).json({ error: "Setting ID is required" });
    }

    const query = "SELECT table_name FROM setting WHERE id = ?";
    const [rows] = await pool.query(query, [settingId]); // Use `.promise()` for async/await

    if (rows.length === 0) {
      return res.status(404).json({ error: "Table name not found" });
    }

    res.json({ table_name: rows[0].table_name });
  } catch (error) {
    console.error("Error fetching table name:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
// Add a new setting for a custome
exports.addSetting = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { customer_id, name, table_name, projectName, customerName } = req.body;
    console.log(req.body);

    if (!customer_id || !name || !table_name || !projectName || !customerName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await connection.beginTransaction();

    // Step 1: Fetch mvvariables
    const [customerRows] = await connection.query(
      "SELECT mvvariables FROM customer WHERE id = ?",
      [customer_id]
    );

    if (customerRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: "Customer not found" });
    }

    const originalMvvariables = customerRows[0].mvvariables;

    let uniqueArray1 = [];
    try {
      uniqueArray1 = JSON.parse(originalMvvariables);
    } catch (parseErr) {
      await connection.rollback();
      console.error("Error parsing mvvariables JSON:", parseErr);
      return res.status(500).json({ message: "Invalid mvvariables format in customer table" });
    }

    // Step 2: Insert into setting table
    const [result] = await connection.query(
      "INSERT INTO setting (customer_id, name, table_name) VALUES (?, ?, ?)",
      [customer_id, name, table_name]
    );

    const settingId = result.insertId;

    const [[newSetting]] = await connection.query(
      "SELECT id, name, table_name FROM setting WHERE id = ?",
      [settingId]
    );

    // Step 3: Create table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS \`${newSetting.table_name}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        serial_number INT NOT NULL,
        Tunning_param VARCHAR(512) DEFAULT NULL
      )
    `;
    await connection.query(createTableQuery);

    // Step 4: Insert default variables into the new setting table
    if (uniqueArray1.length > 0) {
      const insertQuery = `INSERT INTO \`${newSetting.table_name}\` (serial_number, Tunning_param) VALUES ?`;
      const values = uniqueArray1.map((param, index) => [index + 1, param]);

      try {
        await connection.query(insertQuery, [values]);
      } catch (err) {
        console.error("Error inserting default variables:", err);
        await connection.rollback();
        return res.status(500).json({ message: "Failed to insert default variables", error: err.message });
      }
    }
    await connection.commit();
    const settingdir=path.join(UPLOAD_DIR, projectName, customerName, name);
    if (!fs.existsSync(settingdir)) {
      fs.mkdirSync(settingdir, { recursive: true });
    }
       // SQL Dumps
       try {
             await runDump("setting", path.join(DUMP_DIR, `setting.sql`));
             await runDump(newSetting.table_name, path.join(DUMP_DIR, `${newSetting.table_name}.sql`));
            console.log("✅ All dumps completed successfully.");
          } catch (error) {
            console.error("❌ Error during dumping tables:", error);
          }
        // Git push
        await commitAndPushToGit()
      .then(() => console.log("Done"))
      .catch(err => console.error("Error:", err));
    
    res.json({ message: "Setting added successfully", setting: newSetting });

  } catch (err) {
    console.error("Error in addSetting:", err);
    try {
      await connection.rollback();
    } catch (rollbackErr) {
      console.error("Rollback error:", rollbackErr);
    }
    res.status(500).json({ message: "Database error", error: err.message });
  } finally {
    connection.release();
  }
};