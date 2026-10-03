import Invoice from "../models/Invoice.js";
import Booking from "../models/Booking.js";

const invoicePopulate = [
  {
    path: "booking",
    select:
      "amount estimatedDuration scheduledDate timeSlot status location completionNotes",
  },
  {
    path: "customer",
    select: "name email phone",
  },
  {
    path: "provider",
    select: "name email phone",
  },
  {
    path: "serviceCategory",
    select:
      "name description basePrice pricingUnit",
  },
];

/* =========================================
   GENERATE INVOICE NUMBER
========================================= */

const generateInvoiceNumber = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  const randomPart = Math.floor(
    100000 + Math.random() * 900000
  );

  return `CC-${year}${month}${day}-${randomPart}`;
};

/* =========================================
   CREATE INVOICE
========================================= */

export const createInvoiceForBooking = async (
  bookingId
) => {
  const booking =
    await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found.");
  }

  if (booking.status !== "completed") {
    throw new Error(
      "Invoice can only be generated for completed bookings."
    );
  }

  /* -----------------------------------------
     Prevent duplicate invoices
  ----------------------------------------- */

  const existingInvoice =
    await Invoice.findOne({
      booking: booking._id,
    });

  if (existingInvoice) {
    return existingInvoice;
  }

  const subtotal = Number(
    booking.amount || 0
  );

  const taxRate = 0;

  const taxAmount = Number(
    (
      subtotal *
      (taxRate / 100)
    ).toFixed(2)
  );

  const totalAmount = Number(
    (subtotal + taxAmount).toFixed(2)
  );

  const invoice =
    await Invoice.create({
      invoiceNumber:
        generateInvoiceNumber(),

      booking: booking._id,

      customer: booking.customer,

      provider: booking.provider,

      serviceCategory:
        booking.serviceCategory,

      subtotal,

      taxRate,

      taxAmount,

      totalAmount,

      paymentStatus: "pending",

      invoiceStatus: "issued",

      issuedAt: new Date(),

      notes:
        "Invoice generated automatically after job completion.",
    });

  return invoice;
};

/* =========================================
   GET CUSTOMER INVOICES
========================================= */

export const getCustomerInvoices = async (
  req,
  res
) => {
  try {
    const invoices =
      await Invoice.find({
        customer: req.user._id,
        invoiceStatus: "issued",
      })
        .populate(invoicePopulate)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error(
      "Get customer invoices error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch customer invoices.",
      error: error.message,
    });
  }
};

/* =========================================
   GET PROVIDER INVOICES
========================================= */

export const getProviderInvoices = async (
  req,
  res
) => {
  try {
    const invoices =
      await Invoice.find({
        provider: req.user._id,
        invoiceStatus: "issued",
      })
        .populate(invoicePopulate)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      invoices,
    });
  } catch (error) {
    console.error(
      "Get provider invoices error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch provider invoices.",
      error: error.message,
    });
  }
};

/* =========================================
   GET SINGLE INVOICE
========================================= */

export const getInvoiceById = async (
  req,
  res
) => {
  try {
    const invoice =
      await Invoice.findById(
        req.params.id
      ).populate(invoicePopulate);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    const isCustomer =
      invoice.customer._id.toString() ===
      req.user._id.toString();

    const isProvider =
      invoice.provider._id.toString() ===
      req.user._id.toString();

    const isStaff = [
      "admin",
      "operations",
      "support",
    ].includes(req.user.role);

    if (
      !isCustomer &&
      !isProvider &&
      !isStaff
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to view this invoice.",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error(
      "Get invoice by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch invoice.",
      error: error.message,
    });
  }
};

export {
  generateInvoiceNumber,
};