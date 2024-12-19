import React, { useState } from "react";
import axios from "axios";

const ImportContacts = ({ reloadContacts }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("file", file); // Use 'file' to match backend field name

    try {
      await axios.post("/api/import", formData);
      reloadContacts(); // Refresh the contact list after importing
    } catch (error) {
      console.error("Error importing contact:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" accept=".vcf" onChange={handleFileChange} />
      <button type="submit">Import Contacts</button>
    </form>
  );
};

export default ImportContacts;
