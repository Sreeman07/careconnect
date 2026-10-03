# CareConnect

## AI-Enabled Home Services Booking & Operations Platform

CareConnect is a full-stack MERN application designed to connect customers with verified home-service providers through an intelligent service request, provider matching, quotation, booking, payment, review, and notification workflow.

The platform combines traditional home-service management with AI-powered service classification and provider matching to make the service-booking process faster, more organized, and easier to manage.

---

## Features

### Customer Features

- Customer registration and login
- JWT-based authentication
- Create home-service requests
- Select service categories
- Enter service location and requirements
- Specify budget
- AI-based service classification
- AI-generated service priority
- AI-recommended required skills
- View matched service providers
- Select a service provider
- Receive provider quotations
- Accept or reject quotations
- View bookings
- Track booking status
- View invoices
- Make demo payments
- View payment history
- Submit service reviews
- Receive notifications
- Manage service requests

---

### Service Provider Features

- Provider registration and login
- Provider profile management
- Add service categories
- Manage skills
- Define service areas
- Provider verification status
- View assigned service requests
- Submit quotations
- Set quotation amount
- Set estimated service duration
- Add quotation notes
- Manage bookings
- View provider jobs
- Track completed jobs
- View invoices
- View payment history
- View customer reviews
- Provider rating calculation

---

### Admin Features

- Admin authentication
- Admin dashboard
- View total users
- View customers
- View providers
- View verified providers
- View pending provider verification
- View service categories
- View service requests
- View active bookings
- View completed jobs
- View pending quotations
- Provider management
- Service category management

---

### AI Features

CareConnect integrates Google's Gemini API for AI-assisted service analysis.

The AI system can:

- Classify service requests
- Identify service categories
- Determine service priority
- Estimate classification confidence
- Recommend required provider skills
- Support intelligent provider matching

Example:

```text
Customer Request:
"Bedroom fan is not working."

AI Classification:
Category: Electrical
Priority: Normal
Confidence: 98%

Recommended Skills:
- Fan Installation
- Circuit Troubleshooting
- Wiring

Service Workflow

The main CareConnect workflow is:

Customer
   |
   v
Create Service Request
   |
   v
AI Service Classification
   |
   v
Provider Matching
   |
   v
Provider Selection
   |
   v
Provider Submits Quote
   |
   v
Customer Reviews Quote
   |
   +---- Reject ----> Matching Again
   |
   v
Accept Quote
   |
   v
Booking Created
   |
   v
Service Completed
   |
   v
Invoice Generated
   |
   v
Payment
   |
   v
Customer Review
   |
   v
Provider Rating Updated
Provider Matching

CareConnect uses a matching score to identify suitable providers.

The matching system considers:

Service category
Provider skills
Service area
Provider rating
Number of completed jobs

The system calculates a matching score and displays suitable providers for the customer request.

Booking Management

Once a customer accepts a provider quotation, a booking is created.

Booking statuses include:

scheduled
in_progress
completed
cancelled

When a booking is completed:

The service request is marked completed
Provider completed-job count is updated
An invoice is generated
Customer can submit a review
Invoice & Payment Management

CareConnect supports invoice and payment management.

The platform can:

Generate invoices after completed services
Display invoice details
Track payment status
Create payment transactions
Maintain payment history
Mark invoices as paid after successful demo payment

Payment functionality is currently implemented as a demonstration/synchronous payment workflow and is not connected to a real payment gateway.

Notification System

The notification system keeps users informed about important platform events.

Notifications are generated for events such as:

New service requests
New quotations
Booking updates
Invoice updates
Payment updates
Reviews
Provider-related events

Users can:

View notifications
View unread notification count
Mark individual notifications as read
Mark all notifications as read
Delete notifications
Delete all read notifications
Technology Stack
Frontend
React.js
Vite
JavaScript
HTML5
CSS3
Tailwind CSS
React Router
Axios
Zustand
React Hook Form
React Hot Toast
Backend
Node.js
Express.js
MongoDB
Mongoose
JWT
bcrypt
Cookie Parser
CORS
AI
Google Gemini API
@google/genai
Development Tools
Git
GitHub
VS Code
npm
Nodemon
