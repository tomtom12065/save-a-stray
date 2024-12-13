import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const PaymentForm = () => {
  const [searchParams] = useSearchParams();
  const clientSecret = searchParams.get("clientSecret");
  const appId = searchParams.get("appId");
  const [catDetails, setCatDetails] = useState(null);

  useEffect(() => {
    // Fetch cat details using appId
    fetch(`${process.env.BACKEND_URL}/applications/${appId}`)
      .then((response) => response.json())
      .then((data) => setCatDetails(data.cat))
      .catch((error) => console.error("Error fetching cat details:", error));
  }, [appId]);

  const handlePayment = async () => {
    const stripe = await stripePromise;
    const result = await stripe.confirmCardPayment(clientSecret);
    if (result.error) {
      console.error("Payment failed:", result.error.message);
    } else {
      console.log("Payment successful!");
    }
  };

  return (
    <div>
      <h1>Complete Your Payment</h1>
      {catDetails && <p>Adopting: {catDetails.name}</p>}
      <button onClick={handlePayment}>Pay</button>
    </div>
  );
};

export default PaymentForm;
