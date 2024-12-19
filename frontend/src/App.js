import React, { useEffect, useState } from "react";
import {
  getContacts,
  findDuplicates,
  importContacts,
  exportContacts,
} from "./api"; // Import exportContacts
import ContactList from "./components/ContactList";
import AddContact from "./components/AddContact";
import DuplicateContacts from "./components/DuplicateContacts";
import SearchBar from "./components/SearchBar";
import "./styles.css";

const App = () => {
  const [contacts, setContacts] = useState([]);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicates, setShowDuplicates] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  // Load contacts initially
  useEffect(() => {
    loadContacts();
  }, []);

  // Fetch contacts from backend
  const loadContacts = async () => {
    try {
      const response = await getContacts();
      setContacts(response.data); // Update contacts state
      setFilteredContacts(response.data); // Also update filtered contacts
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  // Fetch duplicate contacts from backend
  const loadDuplicates = async () => {
    try {
      const response = await findDuplicates();
      setDuplicates(response.data);
      setShowDuplicates(true); // Show duplicate contacts section
    } catch (error) {
      console.error("Error finding duplicates:", error);
    }
  };

  // Search contacts by name
  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredContacts(contacts); // Reset to full contacts if search is empty
    } else {
      const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredContacts(filtered); // Update the filtered contacts
    }
  };

  // Handle file input change for importing contacts
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file); // Store selected file in state
  };

  // Handle importing contacts from file
  const handleImport = async () => {
    if (!selectedFile) {
      alert("Please choose a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile); // Name 'file' should match what multer expects

    try {
      await importContacts(formData); // Call API to handle import
      alert("Contacts imported successfully");
      setSelectedFile(null); // Clear file after successful import
      loadContacts(); // Reload contacts to reflect the import
    } catch (error) {
      console.error("Error importing contacts:", error);
      alert("Error importing contacts. Please check the file format.");
    }
  };

  // Handle Export Contacts
  const handleExport = async () => {
    try {
      const response = await exportContacts(); // Assuming exportContacts is your API call
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "contacts.vcf");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error exporting contacts:", error);
    }
  };

  return (
    <div className="container">
      <h1>Contact Management System</h1>

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} />

      <div className="main-layout">
        {/* Left Side */}
        <div className="left-side">
          <div className="import-section">
            <h3>Import Contacts</h3>
            <input type="file" accept=".vcf" onChange={handleFileChange} />
            <button onClick={handleImport}>Import</button>
          </div>
          <AddContact reloadContacts={loadContacts} />
        </div>

        {/* Right Side */}
        <div className="right-side">
          <div className="contacts-header">
            <h3>All Contacts</h3>
            <button className="export-btn" onClick={handleExport}>
              Export Contacts
            </button>{" "}
            {/* Moved here */}
          </div>
          <ContactList
            contacts={filteredContacts}
            reloadContacts={loadContacts}
          />
          <button className="find-duplicates-btn" onClick={loadDuplicates}>
            Find Duplicates
          </button>
        </div>
      </div>

      {/* Display Duplicate Contacts */}
      {showDuplicates && (
        <DuplicateContacts
          duplicates={duplicates}
          reloadDuplicates={loadDuplicates}
          reloadContacts={loadContacts}
        />
      )}
    </div>
  );
};

export default App;
