import React from "react";

const Payouts = () => {
  const handlePayout = async () => {
    const token = sessionStorage.getItem('token');
    const response = await fetch(process.env.BACKEND_URL + "/api/payout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        // providerId: "provider_stripe_account_id", // Replace with actual Stripe Account ID
        amount: 100, // Payout amount in cents
      }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Payout successful!");
    } else {
      alert("Payout failed!");
    }
  };

  return (
    <div>
      <h3>Payouts</h3>
      <button onClick={handlePayout}>Receive Payout</button>
    </div>
  );
};

export default Payouts;