import React from "react";

const ExportButton = ({ contactId }) => {
  const handleExport = () => {
    window.open(`/api/export/${contactId}`, "_blank");
  };

  return <button onClick={handleExport}>Export as VCF</button>;
};

export default ExportButton;
