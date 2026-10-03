import { useEffect, useState } from "react";

import {
  getProviderPayments,
} from "../../services/paymentService";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getProviderPayments();

      setPayments(
        response.payments || []
      );
    } catch (err) {
      console.error(
        "Fetch provider payment history error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load payment history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatDateTime = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-700";

      case "processing":
        return "bg-amber-100 text-amber-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "refunded":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "success":
        return "Successful";

      case "processing":
        return "Processing";

      case "failed":
        return "Failed";

      case "refunded":
        return "Refunded";

      case "created":
        return "Created";

      default:
        return status || "Unknown";
    }
  };

  const successfulPayments =
    payments.filter(
      (payment) =>
        payment.status === "success"
    );

  const totalReceived =
    successfulPayments.reduce(
      (sum, payment) =>
        sum + Number(payment.amount || 0),
      0
    );

  const pendingPayments =
    payments.filter(
      (payment) =>
        payment.status === "processing" ||
        payment.status === "created"
    );

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading payment history...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment History
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track customer payments associated with your
              completed jobs.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchPayments}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            🔄 Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Transactions
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {payments.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Payment records
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Received
            </p>

            <p className="mt-2 text-3xl font-bold text-green-800">
              ₹
              {totalReceived.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-green-700">
              Successful payments
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              {pendingPayments.length}
            </p>

            <p className="mt-1 text-xs text-amber-700">
              Awaiting processing
            </p>
          </div>
        </div>

        {/* EMPTY */}

        {!error && payments.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              💳
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No payments yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              Payments received from customers will
              appear here.
            </p>
          </div>
        )}

        {/* PAYMENT LIST */}

        <div className="space-y-5">
          {payments.map((payment) => {
            const invoice =
              payment.invoice;

            const booking =
              payment.booking;

            const customer =
              payment.customer;

            return (
              <div
                key={payment._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* HEADER */}

                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900">
                        💳 Transaction
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                          payment.status
                        )}`}
                      >
                        {getStatusLabel(
                          payment.status
                        )}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Transaction ID
                    </p>

                    <p className="break-all text-sm font-semibold text-blue-700">
                      {payment.transactionId}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white px-6 py-4 text-right shadow-sm ring-1 ring-slate-200">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Amount Received
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      ₹
                      {Number(
                        payment.amount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                </div>

                {/* CUSTOMER */}

                <div className="border-b border-slate-200 p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Customer
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {customer?.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "C"}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {customer?.name ||
                          "Customer"}
                      </p>

                      <p className="text-sm text-slate-500">
                        {customer?.email ||
                          "Email unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* DETAILS */}

                <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Invoice
                    </p>

                    <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                      {invoice?.invoiceNumber ||
                        "Unavailable"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Payment Method
                    </p>

                    <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                      {payment.paymentMethod ||
                        "Demo"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Currency
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {payment.currency ||
                        "INR"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Payment Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {formatDateTime(
                        payment.paidAt ||
                          payment.createdAt
                      )}
                    </p>
                  </div>
                </div>

                {/* BOOKING */}

                <div className="border-t border-slate-200 px-6 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Booking Reference
                  </p>

                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-400">
                        Booking ID
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-slate-700">
                        {booking?._id ||
                          "Unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Booking Status
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize text-green-700">
                        {booking?.status ||
                          "Unavailable"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}

                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                  <div className="flex flex-col justify-between gap-2 text-sm sm:flex-row">
                    <span className="text-slate-500">
                      Payment recorded by
                      CareConnect
                    </span>

                    <span className="font-semibold text-slate-700">
                      {formatDateTime(
                        payment.createdAt
                      )}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;