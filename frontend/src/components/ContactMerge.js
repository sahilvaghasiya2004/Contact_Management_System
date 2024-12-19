import React, { useState } from "react";
import axios from "axios";

const ContactMerge = ({ contacts, refreshContacts }) => {
  const [duplicates, setDuplicates] = useState([]);

  const findDuplicates = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/contacts/duplicates"
      );
      setDuplicates(response.data);
    } catch (error) {
      console.error("Error finding duplicates:", error);
    }
  };

  const mergeDuplicates = async (group) => {
    try {
      const contactIds = group.map((contact) => contact._id);
      const mergedContact = { ...group[0] }; // Merge logic can be refined
      await axios.post("http://localhost:8080/api/contacts/merge", {
        contactIds,
        ...mergedContact,
      });
      refreshContacts();
      setDuplicates([]);
    } catch (error) {
      console.error("Error merging contacts:", error);
    }
  };

  return (
    <div>
      <h2>Merge Duplicates</h2>
      <button onClick={findDuplicates}>Find Duplicates</button>
      {duplicates.length > 0 &&
        duplicates.map((group, idx) => (
          <div key={idx}>
            <h4>Duplicate Group {idx + 1}</h4>
            {group.map((contact) => (
              <div key={contact._id}>
                {contact.name} - {contact.email} - {contact.phone}
              </div>
            ))}
            <button onClick={() => mergeDuplicates(group)}>Merge Group</button>
          </div>
        ))}
    </div>
  );
};

export default ContactMerge;
