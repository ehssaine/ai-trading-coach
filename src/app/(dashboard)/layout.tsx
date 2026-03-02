import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: '#0B0E14' }}>
      {/* Market Pulse Strip */}
      <div className="market-pulse fixed top-0 left-0 right-0 z-50" />
      <Sidebar />
      <main className="lg:pl-[260px] min-h-screen">
        <div className="max-w-[1440px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
