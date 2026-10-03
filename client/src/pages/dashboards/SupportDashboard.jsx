const SupportDashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Support Dashboard
      </h1>

      <p className="mt-2 text-slate-600">
        Manage customer issues, cancellations, and disputes.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-4">
        {[
          ["Open Tickets", "0"],
          ["Cancellations", "0"],
          ["Refund Requests", "0"],
          ["Disputes", "0"],
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

export default SupportDashboard;