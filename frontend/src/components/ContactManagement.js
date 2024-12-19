import React, { useState } from "react";
import { getContacts, importContacts, exportContacts } from "../api"; // Make sure to import the new functions

const ContactManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [importFile, setImportFile] = useState(null);

  const reloadContacts = async () => {
    const response = await getContacts();
    setContacts(response.data);
  };

  const handleFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (importFile) {
      try {
        await importContacts(importFile);
        reloadContacts(); // Reload contacts after importing
        setImportFile(null); // Reset file input
      } catch (error) {
        console.error("Error importing contacts:", error);
      }
    }
  };

  const handleExport = async () => {
    try {
      const response = await exportContacts();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "contacts.vcf"); // Specify the file name
      document.body.appendChild(link);
      link.click(); // Trigger download
      link.remove(); // Clean up
    } catch (error) {
      console.error("Error exporting contacts:", error);
    }
  };

  return (
    <div>
      <h1>Contact Management</h1>
      <form onSubmit={handleImport}>
        <input type="file" accept=".vcf" onChange={handleFileChange} required />
        <button type="submit">Import Contacts</button>
      </form>
      <button onClick={handleExport}>Export Contacts</button>

      <h2>Contact List</h2>
      <ul>
        {contacts.map((contact) => (
          <li key={contact._id}>
            {contact.name} - {contact.email} - {contact.phone}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactManagement;
