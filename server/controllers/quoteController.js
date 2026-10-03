import Quote from "../models/Quote.js";
import ServiceRequest from "../models/ServiceRequest.js";
import Booking from "../models/Booking.js";

import { createNotification } from "../services/notificationService.js";

const quotePopulate = [
  {
    path: "serviceRequest",
    populate: [
      {
        path: "customer",
        select: "name email phone",
      },
      {
        path: "serviceCategory",
        select:
          "name description basePrice pricingUnit",
      },
      {
        path: "assignedProvider",
        select:
          "name email phone role isVerified",
      },
    ],
  },
  {
    path: "customer",
    select: "name email phone",
  },
  {
    path: "provider",
    select:
      "name email phone role isVerified",
  },
];

/*
|--------------------------------------------------------------------------
| PROVIDER
| Create a quote for an assigned service request.
|--------------------------------------------------------------------------
*/

export const createQuote = async (req, res) => {
  try {
    const {
      serviceRequestId,
      amount,
      estimatedDuration,
      notes,
    } = req.body;

    if (!serviceRequestId) {
      return res.status(400).json({
        message:
          "Service request ID is required.",
      });
    }

    if (
      amount === undefined ||
      amount === null ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        message:
          "Quote amount must be greater than 0.",
      });
    }

    if (
      estimatedDuration === undefined ||
      estimatedDuration === null ||
      Number(estimatedDuration) <= 0
    ) {
      return res.status(400).json({
        message:
          "Estimated duration must be greater than 0.",
      });
    }

    const serviceRequest =
      await ServiceRequest.findById(
        serviceRequestId
      );

    if (!serviceRequest) {
      return res.status(404).json({
        message:
          "Service request not found.",
      });
    }

    if (!serviceRequest.assignedProvider) {
      return res.status(400).json({
        message:
          "No provider has been assigned to this request.",
      });
    }

    if (
      serviceRequest.assignedProvider.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You can only quote on requests assigned to you.",
      });
    }

    if (
      [
        "cancelled",
        "completed",
        "booked",
      ].includes(serviceRequest.status)
    ) {
      return res.status(400).json({
        message:
          "A quote cannot be submitted for this request in its current status.",
      });
    }

    const existingQuote = await Quote.findOne({
      serviceRequest: serviceRequestId,
    });

    /*
    |--------------------------------------------------------------------------
    | Resubmit previously rejected quote
    |--------------------------------------------------------------------------
    */

    if (existingQuote) {
      if (existingQuote.status === "rejected") {
        existingQuote.provider =
          req.user._id;

        existingQuote.customer =
          serviceRequest.customer;

        existingQuote.amount =
          Number(amount);

        existingQuote.estimatedDuration =
          Number(estimatedDuration);

        existingQuote.notes =
          notes || "";

        existingQuote.status =
          "pending";

        existingQuote.customerResponseAt =
          null;

        existingQuote.expiresAt = null;

        await existingQuote.save();

        serviceRequest.status = "quoted";

        await serviceRequest.save();

        /*
        |--------------------------------------------------------------------------
        | Notify customer about new quote
        |--------------------------------------------------------------------------
        */

        await createNotification({
          recipient:
            serviceRequest.customer,
          sender: req.user._id,
          type: "quote",
          title: "New Quote Received",
          message: `You received a new quote of ₹${Number(
            amount
          ).toLocaleString(
            "en-IN"
          )} from your service provider.`,
          link: "/customer/quotes",
          relatedId:
            existingQuote._id,
        });

        const populatedQuote =
          await Quote.findById(
            existingQuote._id
          ).populate(
            quotePopulate
          );

        return res.status(200).json({
          message:
            "Quote submitted successfully.",
          quote: populatedQuote,
        });
      }

      return res.status(409).json({
        message:
          "A quote already exists for this service request.",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Create new quote
    |--------------------------------------------------------------------------
    */

    const quote = await Quote.create({
      serviceRequest:
        serviceRequest._id,

      customer:
        serviceRequest.customer,

      provider:
        req.user._id,

      amount:
        Number(amount),

      estimatedDuration:
        Number(estimatedDuration),

      notes:
        notes || "",

      status:
        "pending",
    });

    serviceRequest.status =
      "quoted";

    await serviceRequest.save();

    /*
    |--------------------------------------------------------------------------
    | Notify customer
    |--------------------------------------------------------------------------
    */

    await createNotification({
      recipient:
        serviceRequest.customer,

      sender:
        req.user._id,

      type:
        "quote",

      title:
        "New Quote Received",

      message: `You received a new quote of ₹${Number(
        amount
      ).toLocaleString(
        "en-IN"
      )} from your service provider.`,

      link:
        "/customer/quotes",

      relatedId:
        quote._id,
    });

    const populatedQuote =
      await Quote.findById(
        quote._id
      ).populate(
        quotePopulate
      );

    return res.status(201).json({
      message:
        "Quote submitted successfully.",

      quote:
        populatedQuote,
    });
  } catch (error) {
    console.error(
      "Create quote error:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to create quote.",

      error:
        error.message,
    });
  }
};

/*
|--------------------------------------------------------------------------
| PROVIDER
| Get all quotes created by logged-in provider.
|--------------------------------------------------------------------------
*/

export const getProviderQuotes =
  async (req, res) => {
    try {
      const quotes =
        await Quote.find({
          provider:
            req.user._id,
        })
          .populate(
            quotePopulate
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        quotes,
      });
    } catch (error) {
      console.error(
        "Get provider quotes error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch provider quotes.",

        error:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| PROVIDER
| Get service requests assigned to logged-in provider.
|--------------------------------------------------------------------------
*/

export const getAssignedProviderRequests =
  async (req, res) => {
    try {
      const requests =
        await ServiceRequest.find({
          assignedProvider:
            req.user._id,

          status: {
            $in: [
              "matching",
              "quoted",
            ],
          },
        })
          .populate(
            "customer",
            "name email phone"
          )
          .populate(
            "serviceCategory",
            "name description basePrice pricingUnit"
          )
          .sort({
            createdAt: -1,
          });

      const requestIds =
        requests.map(
          (request) =>
            request._id
        );

      const quotes =
        await Quote.find({
          serviceRequest: {
            $in: requestIds,
          },

          provider:
            req.user._id,
        });

      const quoteMap =
        new Map(
          quotes.map(
            (quote) => [
              quote.serviceRequest.toString(),
              quote,
            ]
          )
        );

      const requestsWithQuotes =
        requests.map(
          (request) => ({
            ...request.toObject(),

            quote:
              quoteMap.get(
                request._id.toString()
              ) || null,
          })
        );

      return res.status(200).json({
        requests:
          requestsWithQuotes,
      });
    } catch (error) {
      console.error(
        "Get assigned provider requests error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch assigned service requests.",

        error:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CUSTOMER
| Get all quotes belonging to logged-in customer.
|--------------------------------------------------------------------------
*/

export const getCustomerQuotes =
  async (req, res) => {
    try {
      const quotes =
        await Quote.find({
          customer:
            req.user._id,
        })
          .populate(
            quotePopulate
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        quotes,
      });
    } catch (error) {
      console.error(
        "Get customer quotes error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch customer quotes.",

        error:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CUSTOMER
| Accept a pending quote.
|--------------------------------------------------------------------------
*/

export const acceptQuote =
  async (req, res) => {
    try {
      const quote =
        await Quote.findById(
          req.params.id
        );

      if (!quote) {
        return res.status(404).json({
          message:
            "Quote not found.",
        });
      }

      if (
        quote.customer.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to accept this quote.",
        });
      }

      if (
        quote.status !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            "Only pending quotes can be accepted.",
        });
      }

      const serviceRequest =
        await ServiceRequest.findById(
          quote.serviceRequest
        );

      if (!serviceRequest) {
        return res.status(404).json({
          message:
            "Service request not found.",
        });
      }

      if (
        [
          "cancelled",
          "completed",
          "booked",
        ].includes(
          serviceRequest.status
        )
      ) {
        return res.status(400).json({
          message:
            "This service request cannot be booked in its current status.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Prevent duplicate booking
      |--------------------------------------------------------------------------
      */

      const existingBooking =
        await Booking.findOne({
          serviceRequest:
            serviceRequest._id,
        });

      if (existingBooking) {
        return res.status(409).json({
          message:
            "A booking already exists for this service request.",
        });
      }

      /*
      |--------------------------------------------------------------------------
      | Accept quote
      |--------------------------------------------------------------------------
      */

      quote.status =
        "accepted";

      quote.customerResponseAt =
        new Date();

      await quote.save();

      /*
      |--------------------------------------------------------------------------
      | Create booking
      |--------------------------------------------------------------------------
      */

      const booking =
        await Booking.create({
          serviceRequest:
            serviceRequest._id,

          quote:
            quote._id,

          customer:
            serviceRequest.customer,

          provider:
            quote.provider,

          serviceCategory:
            serviceRequest.serviceCategory,

          amount:
            quote.amount,

          estimatedDuration:
            quote.estimatedDuration,

          scheduledDate:
            serviceRequest.preferredDate,

          timeSlot:
            serviceRequest.preferredTimeSlot,

          location: {
            address:
              serviceRequest
                .location.address,

            city:
              serviceRequest
                .location.city,

            state:
              serviceRequest
                .location.state,

            pincode:
              serviceRequest
                .location.pincode,
          },

          status:
            "scheduled",
        });

      /*
      |--------------------------------------------------------------------------
      | Update service request
      |--------------------------------------------------------------------------
      */

      serviceRequest.status =
        "booked";

      await serviceRequest.save();

      /*
      |--------------------------------------------------------------------------
      | Notify provider
      |--------------------------------------------------------------------------
      */

      await createNotification({
        recipient:
          quote.provider,

        sender:
          req.user._id,

        type:
          "quote",

        title:
          "Quote Accepted",

        message:
          "Your quote has been accepted. A new booking has been created.",

        link:
          "/provider/jobs",

        relatedId:
          booking._id,
      });

      /*
      |--------------------------------------------------------------------------
      | Notify customer
      |--------------------------------------------------------------------------
      */

      await createNotification({
        recipient:
          quote.customer,

        sender:
          req.user._id,

        type:
          "booking",

        title:
          "Booking Confirmed",

        message:
          "Your quote has been accepted and your booking has been created successfully.",

        link:
          "/customer/bookings",

        relatedId:
          booking._id,
      });

      const populatedQuote =
        await Quote.findById(
          quote._id
        ).populate(
          quotePopulate
        );

      const populatedBooking =
        await Booking.findById(
          booking._id
        ).populate([
          {
            path:
              "customer",

            select:
              "name email phone",
          },

          {
            path:
              "provider",

            select:
              "name email phone role isVerified",
          },

          {
            path:
              "serviceCategory",

            select:
              "name description basePrice pricingUnit",
          },
        ]);

      return res.status(200).json({
        message:
          "Quote accepted and booking created successfully.",

        quote:
          populatedQuote,

        booking:
          populatedBooking,
      });
    } catch (error) {
      console.error(
        "Accept quote error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to accept quote and create booking.",

        error:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CUSTOMER
| Reject a pending quote.
|--------------------------------------------------------------------------
*/

export const rejectQuote =
  async (req, res) => {
    try {
      const quote =
        await Quote.findById(
          req.params.id
        );

      if (!quote) {
        return res.status(404).json({
          message:
            "Quote not found.",
        });
      }

      if (
        quote.customer.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to reject this quote.",
        });
      }

      if (
        quote.status !==
        "pending"
      ) {
        return res.status(400).json({
          message:
            "Only pending quotes can be rejected.",
        });
      }

      const serviceRequest =
        await ServiceRequest.findById(
          quote.serviceRequest
        );

      if (!serviceRequest) {
        return res.status(404).json({
          message:
            "Service request not found.",
        });
      }

      quote.status =
        "rejected";

      quote.customerResponseAt =
        new Date();

      await quote.save();

      /*
      |--------------------------------------------------------------------------
      | Return request to matching
      |--------------------------------------------------------------------------
      */

      serviceRequest.status =
        "matching";

      await serviceRequest.save();

      /*
      |--------------------------------------------------------------------------
      | Notify provider
      |--------------------------------------------------------------------------
      */

      await createNotification({
        recipient:
          quote.provider,

        sender:
          req.user._id,

        type:
          "quote",

        title:
          "Quote Rejected",

        message:
          "The customer has rejected your quote. The service request has returned to the matching stage.",

        link:
          "/provider/quotes",

        relatedId:
          quote._id,
      });

      const populatedQuote =
        await Quote.findById(
          quote._id
        ).populate(
          quotePopulate
        );

      return res.status(200).json({
        message:
          "Quote rejected successfully.",

        quote:
          populatedQuote,
      });
    } catch (error) {
      console.error(
        "Reject quote error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to reject quote.",

        error:
          error.message,
      });
    }
  };

/*
|--------------------------------------------------------------------------
| CUSTOMER / PROVIDER
| Get a single quote.
|--------------------------------------------------------------------------
*/

export const getQuoteById =
  async (req, res) => {
    try {
      const quote =
        await Quote.findById(
          req.params.id
        ).populate(
          quotePopulate
        );

      if (!quote) {
        return res.status(404).json({
          message:
            "Quote not found.",
        });
      }

      const isCustomer =
        quote.customer._id.toString() ===
        req.user._id.toString();

      const isProvider =
        quote.provider._id.toString() ===
        req.user._id.toString();

      if (
        !isCustomer &&
        !isProvider
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view this quote.",
        });
      }

      return res.status(200).json({
        quote,
      });
    } catch (error) {
      console.error(
        "Get quote by ID error:",
        error
      );

      return res.status(500).json({
        message:
          "Failed to fetch quote.",

        error:
          error.message,
      });
    }
  };