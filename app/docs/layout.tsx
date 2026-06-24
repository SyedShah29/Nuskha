import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation | Shifa',
  description: 'User guide and help documentation for Shifa',
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {children}
    </div>
  );
}
