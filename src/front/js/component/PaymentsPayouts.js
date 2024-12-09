import React, { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Load Stripe with your public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Payouts Component
const Payouts = () => {
  // Your Payouts component logic here
  return (
    <div className="payouts-section mt-5">
      <h3>Provider Payouts</h3>
      {/* Implement your payout handling UI and logic here */}
      <p>Payout functionality coming soon!</p>
    </div>
  );
};

// PaymentForm Component
const PaymentForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    setPaymentProcessing(true);
    setError(null);
    setSuccess(false);

    // Create PaymentIntent on the backend
    fetch(`${process.env.BACKEND_URL}/api/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: amount }), // amount in cents
    })
      .then((response) => response.json())
      .then(({ clientSecret }) => {
        // Confirm the card payment
        stripe
          .confirmCardPayment(clientSecret, {
            payment_method: {
              card: cardElement,
            },
          })
          .then(({ error, paymentIntent }) => {
            if (error) {
              console.error(error);
              setError(error.message);
            } else if (paymentIntent && paymentIntent.status === "succeeded") {
              setSuccess(true);
              console.log("Payment successful!");
            }
            setPaymentProcessing(false);
          })
          .catch((err) => {
            console.error(err);
            setError("An error occurred while confirming the payment.");
            setPaymentProcessing(false);
          });
      })
      .catch((err) => {
        console.error(err);
        setError("An error occurred while creating the payment intent.");
        setPaymentProcessing(false);
      });
  };

  return (
    <div className="card mx-auto shadow-sm" style={{ maxWidth: "800px", width: "100%" }}>
      <div className="card-header bg-primary text-white text-center">
        <h4 className="mb-0">Payment Details</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="cardDetails" className="form-label">
              Card Details
            </label>
            <div className="border rounded p-2">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mt-3" role="alert">
              Payment successful!
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={paymentProcessing || !stripe}
          >
            {paymentProcessing ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Processing...
              </>
            ) : (
              `Pay $${(amount / 100).toFixed(2)}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Combined PaymentsPayouts Component
const PaymentsPayouts = () => {
  const amountInCents = 2500; // Example amount: $25.00

  return (
    <div className="payments-payouts container my-5">
      <h2 className="mb-4">Payments & Payouts</h2>
      <Elements stripe={stripePromise}>
        <PaymentForm amount={amountInCents} />
        <Payouts />
      </Elements>
    </div>
  );
};

export default PaymentsPayouts;
