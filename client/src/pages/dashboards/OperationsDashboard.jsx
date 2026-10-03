const OperationsDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Operations Dashboard
      </h1>

      <p className="mt-2 text-slate-600">
        Monitor bookings, providers, and service operations.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        {[
          ["New Requests", "0"],
          ["Unassigned Jobs", "0"],
          ["Active Jobs", "0"],
          ["Escalations", "0"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl bg-white p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500">
              {label}
            </p>

            <p className="mt-2 text-3xl font-bold">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OperationsDashboard;