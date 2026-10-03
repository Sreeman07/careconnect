import { useEffect, useState } from "react";

import {
  getProviderInvoices,
} from "../../services/invoiceService";

const ProviderInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getProviderInvoices();

      setInvoices(
        response.invoices || []
      );
    } catch (err) {
      console.error(
        "Fetch provider invoices error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load invoices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatDate = (date) => {
    if (!date) {
      return "Not available";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

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

  const getPaymentStatusStyles = (
    status
  ) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-amber-100 text-amber-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "refunded":
        return "bg-purple-100 text-purple-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPaymentStatusLabel = (
    status
  ) => {
    switch (status) {
      case "paid":
        return "Paid";

      case "pending":
        return "Payment Pending";

      case "failed":
        return "Payment Failed";

      case "refunded":
        return "Refunded";

      default:
        return status || "Unknown";
    }
  };

  const getInvoiceStatusStyles = (
    status
  ) => {
    switch (status) {
      case "issued":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getInvoiceStatusLabel = (
    status
  ) => {
    switch (status) {
      case "issued":
        return "Issued";

      case "cancelled":
        return "Cancelled";

      default:
        return status || "Unknown";
    }
  };

  const totalRevenue = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.totalAmount || 0),
    0
  );

  const paidAmount = invoices
    .filter(
      (invoice) =>
        invoice.paymentStatus === "paid"
    )
    .reduce(
      (sum, invoice) =>
        sum +
        Number(invoice.totalAmount || 0),
      0
    );

  const pendingAmount = invoices
    .filter(
      (invoice) =>
        invoice.paymentStatus === "pending"
    )
    .reduce(
      (sum, invoice) =>
        sum +
        Number(invoice.totalAmount || 0),
      0
    );

  if (loading) {
    return (
      <div className="min-h-full bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading your invoices...
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
              My Invoices
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track invoices generated from your completed
              service jobs.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchInvoices}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
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

            <button
              type="button"
              onClick={fetchInvoices}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* SUMMARY */}

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Invoices
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {invoices.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Issued invoices
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Value
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹
              {totalRevenue.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Invoice value
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
              Paid
            </p>

            <p className="mt-2 text-3xl font-bold text-green-800">
              ₹
              {paidAmount.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-green-700">
              Payments received
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-800">
              ₹
              {pendingAmount.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-amber-700">
              Awaiting payment
            </p>
          </div>
        </div>

        {/* EMPTY STATE */}

        {!error && invoices.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">
              🧾
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              No invoices yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Invoices will appear here after you
              complete service jobs.
            </p>
          </div>
        )}

        {/* INVOICE LIST */}

        <div className="space-y-5">
          {invoices.map((invoice) => {
            const booking =
              invoice.booking;

            const customer =
              invoice.customer;

            const category =
              invoice.serviceCategory;

            return (
              <div
                key={invoice._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                {/* HEADER */}

                <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">
                          🧾 {invoice.invoiceNumber}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getInvoiceStatusStyles(
                            invoice.invoiceStatus
                          )}`}
                        >
                          {getInvoiceStatusLabel(
                            invoice.invoiceStatus
                          )}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getPaymentStatusStyles(
                            invoice.paymentStatus
                          )}`}
                        >
                          {getPaymentStatusLabel(
                            invoice.paymentStatus
                          )}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        Issued on{" "}
                        {formatDateTime(
                          invoice.issuedAt
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-6 py-4 text-right shadow-sm ring-1 ring-slate-200">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Invoice Total
                      </p>

                      <p className="mt-1 text-2xl font-bold text-slate-900">
                        ₹
                        {Number(
                          invoice.totalAmount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CUSTOMER + SERVICE */}

                <div className="grid gap-6 border-b border-slate-200 p-6 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Customer
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center gap-3">
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

                      {customer?.phone && (
                        <p className="mt-3 text-sm text-slate-500">
                          📞 {customer.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Service
                    </p>

                    <div className="mt-3 rounded-xl border border-slate-200 p-4">
                      <p className="font-semibold text-slate-900">
                        {category?.name ||
                          "Home Service"}
                      </p>

                      {category?.description && (
                        <p className="mt-1 text-sm leading-5 text-slate-500">
                          {
                            category.description
                          }
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* BOOKING */}

                <div className="p-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Booking Details
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Booking ID
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-800">
                        {booking?._id ||
                          "Unavailable"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Scheduled Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        📅{" "}
                        {formatDate(
                          booking?.scheduledDate
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Duration
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        ⏱️{" "}
                        {booking?.estimatedDuration ||
                          0}{" "}
                        hour
                        {booking?.estimatedDuration !==
                        1
                          ? "s"
                          : ""}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">
                        Job Status
                      </p>

                      <p className="mt-1 text-sm font-semibold text-green-700">
                        ✓{" "}
                        {booking?.status ===
                        "completed"
                          ? "Completed"
                          : booking?.status ||
                            "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AMOUNT */}

                <div className="border-t border-slate-200 px-6 py-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Amount Breakdown
                  </p>

                  <div className="mt-4 ml-auto max-w-md space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Subtotal
                      </span>

                      <span className="font-medium text-slate-800">
                        ₹
                        {Number(
                          invoice.subtotal || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Tax (
                        {invoice.taxRate || 0}
                        %)
                      </span>

                      <span className="font-medium text-slate-800">
                        ₹
                        {Number(
                          invoice.taxAmount || 0
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-bold text-slate-900">
                          Total
                        </span>

                        <span className="text-xl font-bold text-slate-900">
                          ₹
                          {Number(
                            invoice.totalAmount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* NOTES */}

                {invoice.notes && (
                  <div className="border-t border-slate-200 px-6 py-5">
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                        Invoice Notes
                      </p>

                      <p className="mt-2 text-sm leading-6 text-blue-900">
                        {invoice.notes}
                      </p>
                    </div>
                  </div>
                )}

                {/* PAYMENT */}

                <div className="border-t border-slate-200 bg-slate-50 px-6 py-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Payment Status
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {invoice.paymentStatus ===
                        "paid"
                          ? `Payment received on ${formatDateTime(
                              invoice.paidAt
                            )}`
                          : "Customer payment is still pending."}
                      </p>
                    </div>

                    <span
                      className={`rounded-lg px-4 py-2 text-sm font-semibold ${getPaymentStatusStyles(
                        invoice.paymentStatus
                      )}`}
                    >
                      {getPaymentStatusLabel(
                        invoice.paymentStatus
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

export default ProviderInvoices;