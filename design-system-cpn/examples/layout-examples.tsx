// MM Design System - Layout Examples
// Copy these patterns to implement layouts in your application

import React from 'react';

export function LayoutExamples() {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-heading text-mm-white">Layout Examples</h2>

      {/* Navigation Layouts */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Navigation Layouts</h3>

        {/* Sidebar Navigation */}
        <div className="bg-mm-dark2 rounded-lg p-4 mb-6">
          <h4 className="text-md font-heading text-mm-white mb-3">Desktop Sidebar</h4>
          <div className="flex h-64">
            {/* Sidebar */}
            <aside className="w-64 bg-mm-dark border-r border-mm-gray/20 p-4">
              <div className="mb-6">
                <h1 className="text-xl font-heading text-mm-blue">CPN</h1>
                <p className="text-xs text-mm-gray">Cost Per Nut Calculator</p>
              </div>

              <nav className="space-y-1">
                <div className="sidebar-item active">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span>Dashboard</span>
                </div>
                <div className="sidebar-item">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Girls</span>
                </div>
                <div className="sidebar-item">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Analytics</span>
                </div>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 bg-mm-dark">
              <div className="text-mm-gray text-sm">Main content area</div>
            </main>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="bg-mm-dark2 rounded-lg p-4">
          <h4 className="text-md font-heading text-mm-white mb-3">Mobile Bottom Navigation</h4>
          <div className="bg-mm-dark rounded-lg overflow-hidden">
            <div className="h-48 p-4 border-b border-mm-gray/20">
              <div className="text-mm-gray text-sm">Mobile content area</div>
            </div>
            <div className="bg-mm-dark2 p-2">
              <div className="flex justify-around">
                <div className="mobile-nav-item active">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  <span className="text-xs mt-1">Home</span>
                </div>
                <div className="mobile-nav-item">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs mt-1">Girls</span>
                </div>
                <div className="mobile-nav-item">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-xs mt-1">Add</span>
                </div>
                <div className="mobile-nav-item">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs mt-1">Stats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Layouts */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Grid Layouts</h3>

        {/* Card Grid */}
        <div className="mb-6">
          <h4 className="text-md font-heading text-mm-white mb-3">Responsive Card Grid</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card-mm h-24 flex items-center justify-center">
                <span className="text-mm-gray">Card {i}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="mb-6">
          <h4 className="text-md font-heading text-mm-white mb-3">Statistics Grid</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-mm text-center">
              <p className="text-2xl font-heading text-mm-blue">$2,450</p>
              <p className="text-xs text-mm-gray">Total Spent</p>
            </div>
            <div className="card-mm text-center">
              <p className="text-2xl font-heading text-mm-blue">15</p>
              <p className="text-xs text-mm-gray">Total Sessions</p>
            </div>
            <div className="card-mm text-center">
              <p className="text-2xl font-heading text-mm-blue">$163.33</p>
              <p className="text-xs text-mm-gray">Avg Cost</p>
            </div>
            <div className="card-mm text-center">
              <p className="text-2xl font-heading text-mm-blue">12.5h</p>
              <p className="text-xs text-mm-gray">Total Time</p>
            </div>
          </div>
        </div>

        {/* Data Grid with Mobile Cards */}
        <div>
          <h4 className="text-md font-heading text-mm-white mb-3">Data Grid (Mobile Responsive)</h4>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="table-cpn">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Total Spent</th>
                  <th>Cost/Nut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sarah</td>
                  <td>8.5</td>
                  <td>$2,450</td>
                  <td>$163.33</td>
                  <td>
                    <button className="text-mm-gray hover:text-mm-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Emma</td>
                  <td>9.0</td>
                  <td>$1,890</td>
                  <td>$189.00</td>
                  <td>
                    <button className="text-mm-gray hover:text-mm-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            <div className="card-mm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-heading text-mm-white">Sarah</h3>
                  <span className="text-sm text-mm-blue">Rating: 8.5</span>
                </div>
                <button className="text-mm-gray hover:text-mm-white transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-mm-gray">Total Spent</span>
                  <p className="text-mm-white font-medium">$2,450</p>
                </div>
                <div>
                  <span className="text-mm-gray">Cost/Nut</span>
                  <p className="text-mm-blue font-medium">$163.33</p>
                </div>
              </div>
            </div>

            <div className="card-mm">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-heading text-mm-white">Emma</h3>
                  <span className="text-sm text-mm-blue">Rating: 9.0</span>
                </div>
                <button className="text-mm-gray hover:text-mm-white transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-mm-gray">Total Spent</span>
                  <p className="text-mm-white font-medium">$1,890</p>
                </div>
                <div>
                  <span className="text-mm-gray">Cost/Nut</span>
                  <p className="text-mm-blue font-medium">$189.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Layouts */}
      <section>
        <h3 className="text-lg font-heading text-mm-blue mb-4">Modal Layouts</h3>

        <div className="bg-mm-dark2 rounded-lg p-4">
          <h4 className="text-md font-heading text-mm-white mb-3">Modal Example</h4>
          <div className="relative bg-mm-dark/50 rounded-lg h-64 flex items-center justify-center">
            {/* Modal */}
            <div className="modal-content relative">
              <div className="modal-header">
                <h3 className="text-lg font-heading text-mm-white">Add New Profile</h3>
                <button className="modal-close">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-mm-gray mb-1">Name</label>
                  <input type="text" className="input-cpn" placeholder="Enter name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-mm-gray mb-1">Age</label>
                  <input type="number" className="input-cpn" placeholder="18+" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="btn-mm flex-1">Save</button>
                <button className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Usage Examples:

// 1. Basic App Layout
export const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen bg-mm-dark">
    {/* Desktop Sidebar */}
    <aside className="hidden md:flex md:flex-col md:w-64 md:min-h-screen bg-mm-dark border-r border-mm-gray/20">
      <div className="flex flex-col flex-1 p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-heading text-mm-blue">CPN</h1>
          <p className="text-sm text-mm-gray">Cost Per Nut Calculator</p>
        </div>

        <nav className="flex-1 space-y-2">
          {/* Navigation items */}
        </nav>
      </div>
    </aside>

    {/* Main Content */}
    <main className="flex-1 overflow-auto pb-16 md:pb-0">
      {children}
    </main>

    {/* Mobile Navigation */}
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-mm-dark2 border-t border-mm-gray/20">
      <div className="grid grid-cols-4 py-2">
        {/* Mobile nav items */}
      </div>
    </div>
  </div>
);

// 2. Page Layout with Header
export const PageLayout = ({
  title,
  subtitle,
  action,
  children
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-heading text-mm-white">{title}</h1>
        {subtitle && <p className="text-mm-gray mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);

// 3. Grid Container
export const GridContainer = ({
  children,
  cols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
}: {
  children: React.ReactNode;
  cols?: string;
}) => (
  <div className={`grid ${cols} gap-6`}>
    {children}
  </div>
);

// 4. Modal Wrapper
export const Modal = ({
  isOpen,
  onClose,
  title,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="text-lg font-heading text-mm-white">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </>
  );
};

// 5. Data Table with Mobile Cards
export const ResponsiveDataTable = ({
  headers,
  data,
  renderRow,
  renderCard
}: {
  headers: string[];
  data: any[];
  renderRow: (item: any) => React.ReactNode;
  renderCard: (item: any) => React.ReactNode;
}) => (
  <>
    {/* Desktop Table */}
    <div className="hidden md:block">
      <table className="table-cpn">
        <thead>
          <tr>
            {headers.map(header => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>{renderRow(item)}</tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile Cards */}
    <div className="md:hidden space-y-4">
      {data.map((item, index) => (
        <div key={index}>{renderCard(item)}</div>
      ))}
    </div>
  </>
);