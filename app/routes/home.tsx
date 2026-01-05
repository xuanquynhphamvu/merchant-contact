import type { Route } from "./+types/home";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Merchant Contact Manager" },
    { name: "description", content: "Manage your customer contacts efficiently" },
  ];
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Merchant Contact Manager
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              A production-ready customer management system built with React Router v7, TypeScript, and MongoDB
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-3xl mb-3">📇</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
                CRUD Operations
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create, read, update, and delete customer records with ease
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
                Search & Filter
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Advanced search and filtering by status, tags, and more
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-50">
                Analytics
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Real-time statistics and aggregated insights
              </p>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-12 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-slate-50">
              Tech Stack
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {['React Router v7', 'TypeScript', 'MongoDB', 'Tailwind CSS', 'Shadcn UI'].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="mt-8 text-sm text-slate-500 dark:text-slate-400">
            <p>✅ Project initialized and ready for development</p>
          </div>
        </div>
      </div>
    </div>
  );
}
