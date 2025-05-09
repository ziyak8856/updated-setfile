import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProjects, loginUser } from "../services/api";  // Import API functions
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedProjectName, setSelectedProjectName] = useState("");
  const [newProject, setNewProject] = useState(false);
  const navigate = useNavigate();
  
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     navigate("/dashboard"); // Redirect if already logged in
  //   }
  // }, [navigate]);

  useEffect(() => {
    const getProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch projects");
      }
    };

    getProjects();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      // localStorage.setItem("projectId", response.projectId);
      if (newProject) {
        navigate("/create-project");
      } else if (selectedProject) {
        localStorage.setItem("projectId", selectedProject);
        localStorage.setItem("projectName", selectedProjectName);
        navigate("/dashboard");
      }
    } catch (errorMessage) {
      alert(errorMessage);
    }
  };

  return (
    <div className="container login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Select Project:</label>
                    <select 
              value={selectedProject} 
              onChange={(e) => { 
                const selectedId = e.target.value;
                const selectedProj = projects.find(proj => proj.id === parseInt(selectedId));

                if (selectedProj) {
                  setSelectedProject(selectedId); 
                  setSelectedProjectName(selectedProj.name); // Store project name
                  setNewProject(false);
                }
              }} 
            >
              <option value="">-- Select --</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>{proj.name}</option>
              ))}
            </select>

        <div className="radio-group">
          <label>
            <input type="radio" name="projectOption" checked={newProject} onChange={() => { setNewProject(true); setSelectedProject(""); }} />
            Create New Project
          </label>
        </div>

        <button type="submit" disabled={!newProject && !selectedProject}>Login</button>
      </form>
    </div>
  );
};

export default Login;