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
// Get all modes for a customer
exports.getModesByCustomer = async (req, res) => {
  const { customerId } = req.params;

  try {
    const query = "SELECT * FROM mode WHERE customer_id = ?";
    const [modes] = await pool.query(query, [customerId]);

    res.json(modes);
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err.message });
  }
};


// Add a new mode for a customerexports.addMode = async (req, res) => {
  exports.addMode = async (req, res) => {
    const { customer_id, name } = req.body;
  
    if (!customer_id || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }
  
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
  
      const query = `
        INSERT INTO mode (customer_id, name)
        VALUES (?, ?)
      `;
      const [result] = await connection.query(query, [customer_id, name]);
  
      await connection.commit();
        try {
              await runDump("mode", path.join(DUMP_DIR, `mode.sql`));
              console.log("✅ All dumps completed successfully.");
            } catch (error) {
              console.error("❌ Error during dumping tables:", error);
            }
          // Git push
       await commitAndPushToGit()
        .then(() => console.log("Done"))
        .catch(err => console.error("Error:", err));
      res.json({ message: "Mode added", modeId: result.insertId });
    } catch (err) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback error:", rollbackErr);
      }
      console.error("Error adding mode:", err);
      res.status(500).json({ message: "Database error", error: err.message });
    } finally {
      connection.release();
    }
  };