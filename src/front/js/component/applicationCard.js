// ApplicationCard.js
import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";

const ApplicationCard = ({ application, catName }) => {
  const { actions } = useContext(Context);
  const [currentStatus, setCurrentStatus] = useState(application.status);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setLoading(true);
    const result = await actions.updateApplicationStatus(application.id, newStatus);
    setLoading(false);

    if (result.success) {
      setCurrentStatus(newStatus);
    } else {
      alert("Error: " + result.message);
    }
  };

  return (
    <div className="card application-card">
      <div className="card-body">
        <h5 className="card-title">Application for khdjvkjvibi{catName}</h5>
        <p><strong>Applicant Name:</strong> {application.applicant_name}</p>
        <p><strong>Contact Info:</strong> {application.contact_info}</p>
        <p><strong>Reason:</strong> {application.reason}</p>
        <p><strong>Status:</strong> {currentStatus}</p>

        <div className="d-flex gap-2">
          <button
            className="btn btn-success btn-sm"
            onClick={() => handleStatusChange("approved")}
            // disabled={loading || currentStatus === "approved"}
          >
            Approve
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => handleStatusChange("rejected")}
            // disabled={loading || currentStatus === "rejected"}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
