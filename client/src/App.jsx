import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

import DashboardLayout from "./components/layouts/DashboardLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";

import useAuthStore from "./store/authStore";

import AdminDashboard from "./pages/dashboards/AdminDashboard";
import CustomerDashboard from "./pages/dashboards/CustomerDashboard";
import OperationsDashboard from "./pages/dashboards/OperationsDashboard";
import ProviderDashboard from "./pages/dashboards/ProviderDashboard";
import SupportDashboard from "./pages/dashboards/SupportDashboard";

import ProviderManagement from "./pages/admin/ProviderManagement";
import ServiceCategoryManagement from "./pages/admin/ServiceCategoryManagement";

import ServiceRequests from "./pages/customer/ServiceRequests";
import CreateServiceRequest from "./pages/customer/CreateServiceRequest";
import RequestDetails from "./pages/customer/RequestDetails";
import EditServiceRequest from "./pages/customer/EditServiceRequest";
import CustomerQuotes from "./pages/customer/CustomerQuotes";
import CustomerBookings from "./pages/customer/CustomerBookings";
import CustomerInvoices from "./pages/customer/CustomerInvoices";
import CustomerPaymentHistory from "./pages/customer/PaymentHistory";

import ProviderProfile from "./pages/provider/ProviderProfile";
import ProviderQuotes from "./pages/provider/ProviderQuotes";
import ProviderJobs from "./pages/provider/ProviderJobs";
import ProviderReviews from "./pages/provider/ProviderReviews";
import ProviderInvoices from "./pages/provider/ProviderInvoices";
import ProviderPaymentHistory from "./pages/provider/PaymentHistory";

import Notifications from "./components/common/Notifications";

const DashboardRedirect = () => {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  switch (user.role) {
    case "customer":
      return (
        <Navigate
          to="/dashboard/customer"
          replace
        />
      );

    case "provider":
      return (
        <Navigate
          to="/dashboard/provider"
          replace
        />
      );

    case "admin":
      return (
        <Navigate
          to="/dashboard/admin"
          replace
        />
      );

    case "operations":
      return (
        <Navigate
          to="/dashboard/operations"
          replace
        />
      );

    case "support":
      return (
        <Navigate
          to="/dashboard/support"
          replace
        />
      );

    default:
      return (
        <Navigate
          to="/"
          replace
        />
      );
  }
};

const App = () => {
  return (
    <Routes>
      {/* =========================================
          PUBLIC
      ========================================= */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =========================================
          GENERAL DASHBOARD
      ========================================= */}

      <Route
        element={
          <ProtectedRoute />
        }
      >
        <Route
          path="/dashboard"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <DashboardRedirect />
            }
          />
        </Route>

        {/* =====================================
            NOTIFICATIONS
        ===================================== */}

        <Route
          path="/notifications"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <Notifications />
            }
          />
        </Route>
      </Route>

      {/* =========================================
          CUSTOMER
      ========================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "customer",
            ]}
          />
        }
      >
        <Route
          path="/dashboard/customer"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <CustomerDashboard />
            }
          />

          <Route
            path="requests"
            element={
              <ServiceRequests />
            }
          />

          <Route
            path="requests/new"
            element={
              <CreateServiceRequest />
            }
          />

          <Route
            path="requests/:id"
            element={
              <RequestDetails />
            }
          />

          <Route
            path="requests/:id/edit"
            element={
              <EditServiceRequest />
            }
          />
        </Route>

        <Route
          path="/customer/quotes"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <CustomerQuotes />
            }
          />
        </Route>

        <Route
          path="/customer/bookings"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <CustomerBookings />
            }
          />
        </Route>

        <Route
          path="/customer/invoices"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <CustomerInvoices />
            }
          />
        </Route>

        <Route
          path="/customer/payments"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <CustomerPaymentHistory />
            }
          />
        </Route>
      </Route>

      {/* =========================================
          PROVIDER
      ========================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "provider",
            ]}
          />
        }
      >
        <Route
          path="/dashboard/provider"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderDashboard />
            }
          />
        </Route>

        <Route
          path="/provider/profile"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderProfile />
            }
          />
        </Route>

        <Route
          path="/provider/quotes"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderQuotes />
            }
          />
        </Route>

        <Route
          path="/provider/jobs"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderJobs />
            }
          />
        </Route>

        <Route
          path="/provider/reviews"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderReviews />
            }
          />
        </Route>

        <Route
          path="/provider/invoices"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderInvoices />
            }
          />
        </Route>

        <Route
          path="/provider/payments"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderPaymentHistory />
            }
          />
        </Route>
      </Route>

      {/* =========================================
          ADMIN
      ========================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "admin",
            ]}
          />
        }
      >
        <Route
          path="/dashboard/admin"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <AdminDashboard />
            }
          />
        </Route>

        <Route
          path="/admin/providers"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ProviderManagement />
            }
          />
        </Route>

        <Route
          path="/admin/service-categories"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <ServiceCategoryManagement />
            }
          />
        </Route>
      </Route>

      {/* =========================================
          OPERATIONS
      ========================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "operations",
            ]}
          />
        }
      >
        <Route
          path="/dashboard/operations"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <OperationsDashboard />
            }
          />
        </Route>
      </Route>

      {/* =========================================
          SUPPORT
      ========================================= */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "support",
            ]}
          />
        }
      >
        <Route
          path="/dashboard/support"
          element={
            <DashboardLayout />
          }
        >
          <Route
            index
            element={
              <SupportDashboard />
            }
          />
        </Route>
      </Route>

      {/* =========================================
          FALLBACK
      ========================================= */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
};

export default App;