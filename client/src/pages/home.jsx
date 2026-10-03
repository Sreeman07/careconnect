import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleBookService = () => {
    navigate("/login");
  };

  const handleBecomeProvider = () => {
    navigate("/login");
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =========================================
          HERO SECTION
      ========================================= */}

      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 ring-1 ring-blue-400/30">
              AI-Powered Home Services
            </span>

            <h1 className="mt-6 text-5xl font-bold tracking-tight sm:text-6xl">
              Reliable home services,
              <span className="text-blue-400">
                {" "}simplified.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              CareConnect helps customers discover trusted service
              providers, compare quotes, schedule jobs, and track
              services from request to completion.
            </p>

            {/* =====================================
                HERO BUTTONS
            ===================================== */}

            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleBookService}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500"
              >
                Book a Service
              </button>

              <button
                type="button"
                onClick={handleBecomeProvider}
                className="rounded-lg border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-800"
              >
                Become a Provider
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          FEATURES SECTION
      ========================================= */}

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Everything you need in one platform
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            From finding the right professional to tracking your
            completed job, CareConnect manages the entire service
            lifecycle.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Trusted Providers",
              description:
                "Discover verified professionals with skills, experience, and ratings.",
            },
            {
              title: "Smart Matching",
              description:
                "AI helps classify your request and identify suitable providers.",
            },
            {
              title: "Easy Booking",
              description:
                "Compare quotes and schedule services based on provider availability.",
            },
            {
              title: "Job Tracking",
              description:
                "Track service progress, evidence, invoices, and completion.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;