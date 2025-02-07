import React, { useState } from "react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";



// how is the this page getting the cat's information
// 








// Load Stripe with your public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Wrapper Component
const PaymentPage = ({ clientSecret, ownerStripeAccountId, catName, amount }) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm
        clientSecret={clientSecret}
        ownerStripeAccountId={ownerStripeAccountId}
        catName={catName}
        amount={amount}
      />
    </Elements>
  );
};

// Main PaymentForm Component
const PaymentForm = ({ clientSecret, ownerStripeAccountId, catName, amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError("Stripe has not loaded. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);

    setPaymentProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      // Confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (result.error) {
        setError(result.error.message);
        setPaymentProcessing(false);
        return;
      }

      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        setSuccess(true);
        console.log("Payment successful!");

        // Trigger backend payout to cat owner
        const payoutResponse = await fetch(`${process.env.BACKEND_URL}/api/payout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: amount, // Amount in cents
            stripe_account_id: ownerStripeAccountId, // Owner's Stripe account ID
          }),
        });

        const payoutData = await payoutResponse.json();

        if (payoutData.success) {
          console.log("Payout successful:", payoutData.transfer_id);
        } else {
          console.error("Payout failed:", payoutData.error);
        }
      }

      setPaymentProcessing(false);
    } catch (err) {
      console.error("Error during payment:", err);
      setError("An error occurred while processing the payment.");
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="card mx-auto shadow-sm" style={{ maxWidth: "800px", width: "100%" }}>
      <div className="card-header bg-primary text-white text-center">
        <h4 className="mb-0">Complete Payment for {catName}</h4>
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
              Payment successful! Thank you for adopting {catName}.
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
             <>`Pay $${(amount / 100).toFixed(2)}`
              <p>payment submit button </p>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
