import React, { useState, useEffect } from "react";
import axios from "axios";

const ContactForm = ({ selectedContact, refreshContacts, clearSelection }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    tags: "",
  });

  useEffect(() => {
    if (selectedContact) {
      setFormData(selectedContact);
    }
  }, [selectedContact]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContact) {
        await axios.post("http://localhost:8080/api/contacts/update", formData);
      } else {
        await axios.post("http://localhost:8080/api/contacts/save", formData);
      }
      refreshContacts();
      clearSelection();
      setFormData({ name: "", email: "", phone: "", tags: "" });
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="phone"
        placeholder="Phone"
        value={formData.phone}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="tags"
        placeholder="Tags (comma-separated)"
        value={formData.tags}
        onChange={handleChange}
      />
      <button type="submit">
        {selectedContact ? "Update Contact" : "Add Contact"}
      </button>
      {selectedContact && <button onClick={clearSelection}>Cancel</button>}
    </form>
  );
};

export default ContactForm;
