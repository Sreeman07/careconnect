import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { createNotification } from "../services/notificationService.js";

const paymentPopulate = [
  {
    path: "invoice",
    select:
      "invoiceNumber subtotal taxAmount totalAmount paymentStatus invoiceStatus issuedAt paidAt",
  },
  {
    path: "booking",
    select:
      "amount estimatedDuration scheduledDate timeSlot status",
  },
  {
    path: "customer",
    select: "name email phone",
  },
  {
    path: "provider",
    select: "name email phone",
  },
];

/* =========================================
   SAFE NOTIFICATION HELPER
========================================= */

const sendNotificationSafely = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  link = "",
  relatedId = null,
}) => {
  try {
    await createNotification({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      relatedId,
    });
  } catch (notificationError) {
    console.error(
      "Notification creation error:",
      notificationError
    );
  }
};

/* =========================================
   GENERATE TRANSACTION ID
========================================= */

const generateTransactionId = () => {
  const timestamp = Date.now();

  const randomPart = Math.floor(
    100000 + Math.random() * 900000
  );

  return `CC-TXN-${timestamp}-${randomPart}`;
};

/* =========================================
   CREATE PAYMENT
========================================= */

export const createPayment = async (
  req,
  res
) => {
  try {
    const { invoiceId } = req.body;

    if (!invoiceId) {
      return res.status(400).json({
        success: false,
        message: "Invoice ID is required.",
      });
    }

    const invoice =
      await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found.",
      });
    }

    /* -----------------------------------------
       Customer ownership
    ----------------------------------------- */

    if (
      invoice.customer.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to pay this invoice.",
      });
    }

    /* -----------------------------------------
       Invoice validation
    ----------------------------------------- */

    if (
      invoice.invoiceStatus !== "issued"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This invoice is not available for payment.",
      });
    }

    if (
      invoice.paymentStatus === "paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This invoice has already been paid.",
      });
    }

    /* -----------------------------------------
       Existing successful payment
    ----------------------------------------- */

    const existingPayment =
      await Payment.findOne({
        invoice: invoice._id,
        status: "success",
      });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message:
          "A successful payment already exists for this invoice.",
      });
    }

    /* -----------------------------------------
       Create payment
    ----------------------------------------- */

    const payment =
      await Payment.create({
        invoice: invoice._id,
        booking: invoice.booking,
        customer: invoice.customer,
        provider: invoice.provider,
        amount: invoice.totalAmount,
        currency: "INR",
        paymentMethod: "demo",
        transactionId:
          generateTransactionId(),
        status: "processing",
      });

    /* -----------------------------------------
       Demo payment processing

       In the real gateway version this section
       will be replaced by Razorpay/Stripe
       verification.
    ----------------------------------------- */

    payment.status = "success";
    payment.paidAt = new Date();

    await payment.save();

    /* -----------------------------------------
       Update invoice
    ----------------------------------------- */

    invoice.paymentStatus = "paid";
    invoice.paidAt = payment.paidAt;

    await invoice.save();

    /* -----------------------------------------
       Notify customer
    ----------------------------------------- */

    await sendNotificationSafely({
      recipient: invoice.customer,
      sender: invoice.customer,
      type: "payment",
      title: "Payment Successful",
      message: `Your payment of ₹${invoice.totalAmount} was completed successfully.`,
      link: "/customer/payments",
      relatedId: payment._id,
    });

    /* -----------------------------------------
       Notify provider
    ----------------------------------------- */

    await sendNotificationSafely({
      recipient: invoice.provider,
      sender: invoice.customer,
      type: "payment",
      title: "Payment Received",
      message: `Payment of ₹${invoice.totalAmount} has been received for your completed service.`,
      link: "/provider/payments",
      relatedId: payment._id,
    });

    /* -----------------------------------------
       Populate payment
    ----------------------------------------- */

    const populatedPayment =
      await Payment.findById(
        payment._id
      ).populate(paymentPopulate);

    return res.status(200).json({
      success: true,
      message:
        "Payment completed successfully.",
      payment: populatedPayment,
      invoice,
    });
  } catch (error) {
    console.error(
      "Create payment error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process payment.",
      error: error.message,
    });
  }
};

/* =========================================
   CUSTOMER PAYMENTS
========================================= */

export const getCustomerPayments = async (
  req,
  res
) => {
  try {
    const payments =
      await Payment.find({
        customer: req.user._id,
      })
        .populate(paymentPopulate)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Get customer payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment history.",
      error: error.message,
    });
  }
};

/* =========================================
   PROVIDER PAYMENTS
========================================= */

export const getProviderPayments = async (
  req,
  res
) => {
  try {
    const payments =
      await Payment.find({
        provider: req.user._id,
      })
        .populate(paymentPopulate)
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error(
      "Get provider payments error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch provider payments.",
      error: error.message,
    });
  }
};

/* =========================================
   GET PAYMENT BY ID
========================================= */

export const getPaymentById = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findById(
        req.params.id
      ).populate(paymentPopulate);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const isCustomer =
      payment.customer._id.toString() ===
      req.user._id.toString();

    const isProvider =
      payment.provider._id.toString() ===
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
          "You are not authorized to view this payment.",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error(
      "Get payment by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch payment.",
      error: error.message,
    });
  }
};