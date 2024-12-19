import React, { useEffect } from "react";
import { mergeContacts } from "../api";

const DuplicateContacts = ({
  duplicates = [],
  reloadDuplicates,
  reloadContacts,
}) => {
  useEffect(() => {
    reloadDuplicates(); // Load duplicates when component mounts
  }, []);

  const handleMerge = async (group) => {
    const contactIds = group.map((contact) => contact._id);
    const { name, email, phone } = group[0]; // Using the first contact's data as base
    try {
      await mergeContacts({ contactIds, name, email, phone });

      reloadDuplicates(); // Refresh the duplicate contacts list
      reloadContacts(); // Refresh the main contacts list
    } catch (error) {
      console.error("Error merging contacts:", error);
    }
  };

  return (
    <div className="duplicates">
      <h2>Duplicate Contacts</h2>
      {duplicates.length > 0 ? (
        <ul>
          {duplicates.map((group, idx) => (
            <li key={idx}>
              {group.map((contact) => (
                <div key={contact._id}>
                  <span>
                    {contact.name} - {contact.email} - {contact.phone}
                  </span>
                </div>
              ))}
              <button onClick={() => handleMerge(group)}>Merge</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No duplicate contacts found.</p>
      )}
    </div>
  );
};

export default DuplicateContacts;
