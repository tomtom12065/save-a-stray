// ApplicationCard.js
import React, { useState, useContext } from "react";
import { Context } from "../store/appContext";
const ApplicationCard = ({ application, catName, onStatusChange}) => {
  const {actions} = useContext(Context)
  const [currentstatus,setcurrent
  return (
    // <div className="application-card">
    //   <h3>Application for {catName}</h3>
    //   <p>
    //     <strong>Applicant Name:</strong> {application.applicant_name}
    //   </p>
    //   <p>
    //     <strong>Contact Info:</strong> {application.contact_info}
    //   </p>
    //   <p>
    //     <strong>Reason:</strong> {application.reason}
    //   </p>
    //   <p>
    //     <strong>Status:</strong> {application.status}

    //   </p>

    <div className="card application-card">
      {/* <div className="card-header">
      

      </div> */}
      <div className="card-body">

        <p>
          <strong>Applicant Name:</strong> {application.applicant_name}
        </p>
        <p>
          <strong>Contact Info:</strong> {application.contact_info}
        </p>
        <p>
          <strong>Reason:</strong> {application.reason}
        </p>
        <p>
          <strong>Status:</strong> {application.status}

        </p>
        <div className="dropdown">
          <button className="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {application.status}
          </button>
          <ul className="dropdown-menu">
            <li className="dropdown-item" >approve</li>
            <li className="dropdown-item" ></li>

          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
