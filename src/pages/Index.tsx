
import { Dashboard } from '@/components/analytics/Dashboard';
import { sampleData } from '@/lib/data-utils';

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-slate-500">
            Interactive data visualization and analysis
          </p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <Dashboard initialData={sampleData} />
      </main>
      
      <footer className="border-t border-slate-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          Analytics Dashboard - Interactive Data Visualization Tool
        </div>
      </footer>
    </div>
  );
};

export default Index;
