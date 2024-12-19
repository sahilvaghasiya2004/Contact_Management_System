import React, { useState } from "react";
import { updateContact } from "../api"; // Assume you have this API function

const EditContact = ({ contact, onUpdate, onClose }) => {
  const [name, setName] = useState(contact.name);
  const [email, setEmail] = useState(contact.email);
  const [phone, setPhone] = useState(contact.phone);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateContact({ ...contact, name, email, phone });
      onUpdate(); // Call the function to reload contacts
      onClose(); // Close the edit form
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  return (
    <div className="edit-contact">
      <h3>Edit Contact</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit">Update Contact</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default EditContact;
