const Contact = require("../models/contactModel");
const Joi = require("joi");
const fs = require("fs");
const vCardParser = require("vcard-parser");

// Contact Validation Schema using Joi
const contactSchema = Joi.object({
  _id: Joi.string().optional(),
  name: Joi.string().min(3).max(30).required().messages({
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name cannot exceed 30 characters.",
    "any.required": "Name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Please enter a valid email address.",
    "any.required": "Email is required.",
  }),
  phone: Joi.string()
    .length(10)
    .pattern(/[6-9]{1}[0-9]{9}/)
    .required()
    .messages({
      "any.required": "Phone number is required.",
      "string.empty": "Phone number cannot be empty.",
      "string.length": "Phone number must be exactly 10 digits long.",
      "string.pattern.base": "Phone number is invalid.",
    }),
});

// Get all contacts
module.exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.send(contacts);
  } catch (error) {
    res.status(500).send({ message: "Error fetching contacts" });
  }
};

// Add a new contact
module.exports.addContact = async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const { name, email, phone } = req.body;
    const newContact = await Contact.create({ name, email, phone });
    res.status(201).send(newContact);
  } catch (err) {
    res.status(500).send({ message: "Error creating contact" });
  }
};

// Update a contact
module.exports.updateContact = async (req, res) => {
  const { error } = contactSchema.validate(req.body);
  if (error) return res.status(400).send({ message: error.details[0].message });

  try {
    const { _id, name, email, phone } = req.body;
    const updatedContact = await Contact.findByIdAndUpdate(
      _id,
      { name, email, phone },
      { new: true }
    );
    if (!updatedContact)
      return res.status(404).send({ message: "Contact not found" });
    res.send(updatedContact);
  } catch (err) {
    res.status(500).send({ message: "Error updating contact" });
  }
};

// Delete a contact
module.exports.deleteContact = async (req, res) => {
  const { _id } = req.body;
  try {
    const deletedContact = await Contact.findByIdAndDelete(_id);
    if (!deletedContact)
      return res.status(404).send({ message: "Contact not found" });
    res.send({ message: "Contact deleted successfully" });
  } catch (err) {
    res.status(500).send({ message: "Error deleting contact" });
  }
};

// Find Duplicate Contacts
module.exports.findDuplicates = async (req, res) => {
  try {
    const contacts = await Contact.find();
    const groupedContacts = contacts.reduce((acc, contact) => {
      const key = `${contact.name}-${contact.email}-${contact.phone}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(contact);
      return acc;
    }, {});

    const duplicates = Object.values(groupedContacts).filter(
      (group) => group.length > 1
    );
    res.send(duplicates);
  } catch (error) {
    res.status(500).send({ message: "Error finding duplicates" });
  }
};

// Merge Contacts
module.exports.mergeContacts = async (req, res) => {
  const { contactIds, name, email, phone } = req.body;

  try {
    await Contact.deleteMany({ _id: { $in: contactIds } });
    const mergedContact = await Contact.create({ name, email, phone });

    res.send({ message: "Contacts merged successfully", mergedContact });
  } catch (error) {
    res.status(500).send({ message: "Error merging contacts" });
  }
};

// Export contacts as VCF
module.exports.exportContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();

    if (contacts.length === 0) {
      return res.status(404).send({ message: "No contacts found to export." });
    }

    // Create the VCF file content
    const vcfData = contacts
      .map(
        (contact) =>
          `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.name}\nEMAIL:${contact.email}\nTEL:${contact.phone}\nEND:VCARD`
      )
      .join("\n");

    // Set the appropriate headers for file download
    res.setHeader("Content-Disposition", "attachment; filename=contacts.vcf");
    res.setHeader("Content-Type", "text/vcard; charset=utf-8");

    // Send the VCF data
    res.send(vcfData);
  } catch (error) {
    console.error("Error exporting contacts:", error);
    res.status(500).send({ message: "Error exporting contacts." });
  }
};

// Import contacts from a VCF file
module.exports.importContacts = async (req, res) => {
  try {
    // Check if the file is present
    if (!req.file) {
      return res.status(400).send({ message: "No file uploaded." });
    }

    // Read the file contents
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Split file into individual vCards using BEGIN:VCARD and END:VCARD
    const vCards = fileContent.split(/(?=BEGIN:VCARD)/);

    // Loop through each vCard and extract the contact details
    for (const vCard of vCards) {
      // Extract contact information from each vCard
      const nameMatch = vCard.match(/FN:(.*)/);
      const emailMatch = vCard.match(/EMAIL:(.*)/);
      const phoneMatch = vCard.match(/TEL:(.*)/);

      const name = nameMatch ? nameMatch[1].trim() : null;
      const email = emailMatch ? emailMatch[1].trim() : null;
      const phone = phoneMatch ? phoneMatch[1].trim() : null;

      // Skip if required fields are missing
      if (!name || !email || !phone) {
        console.warn("Skipping contact with missing fields:", {
          name,
          email,
          phone,
        });
        continue;
      }

      // Save contact to MongoDB
      const newContact = new Contact({ name, email, phone });
      await newContact.save();
    }

    return res.status(200).send({ message: "Contacts imported successfully." });
  } catch (error) {
    console.error("Error importing contacts:", error);
    return res.status(500).send({ message: "Error importing contacts." });
  }
};
