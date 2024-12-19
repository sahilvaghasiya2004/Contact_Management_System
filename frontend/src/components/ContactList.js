import React, { useState } from "react";
import { updateContact, deleteContact, importContacts } from "../api";

const ContactList = ({ contacts, reloadContacts }) => {
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleEditClick = (contact) => {
    setEditingId(contact._id);
    setEditFormData({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateContact({ _id: editingId, ...editFormData });
      reloadContacts();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating contact:", error);
    }
  };

  const handleDelete = async (_id) => {
    try {
      await deleteContact(_id);
      reloadContacts();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Import Contacts
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        await importContacts(formData); // Assuming this API handles VCF upload
        reloadContacts();
      } catch (error) {
        console.error("Error importing contacts:", error);
      }
    }
  };

  return (
    <div className="contact-list">
      {/* <h2>All Contacts</h2> */}

      <ul>
        {contacts.map((contact) => (
          <li key={contact._id}>
            {editingId === contact._id ? (
              <form onSubmit={handleUpdate}>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleChange}
                  required
                />
                <button type="submit">Save</button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </form>
            ) : (
              <span>
                {contact.name} - {contact.email} - {contact.phone}
              </span>
            )}
            <button onClick={() => handleEditClick(contact)}>Edit</button>
            <button onClick={() => handleDelete(contact._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContactList;
