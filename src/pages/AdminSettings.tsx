import { Header } from '../components/Header';

export function AdminSettings() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">View application rules and settings</p>
        </div>

        <div className="space-y-6">
          {/* Entry Editing Rules */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Entry Editing Rules</h2>

            <div className="space-y-4">
              {/* In Progress Entries */}
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-amber-900">In-Progress Entries</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      When users log time, they can leave the end time empty to mark it as "in progress".
                      Users can only add an end time and notes to complete the entry - they cannot change the activity or start time.
                      Users cannot delete in-progress entries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Completed Entries */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">Completed Entries</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Once a user adds an end time to an entry, it becomes "completed" and locked.
                      Only administrators can edit or delete completed entries.
                    </p>
                  </div>
                </div>
              </div>

              {/* Date Restrictions */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">Date Restrictions</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Users can only add new time entries for today's date.
                      They cannot add entries for past or future dates.
                      This restriction does not apply to administrators.
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Override */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-purple-900">Administrator Override</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Administrators can add, edit, and delete any entries for any user at any time,
                      regardless of completion status or date restrictions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
