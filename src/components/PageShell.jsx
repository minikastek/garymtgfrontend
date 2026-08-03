export default function PageShell({ children, className = '' }) {
  return (
    <main className={`mx-auto max-w-[1100px] px-5 py-10 ${className}`}>
      {children}
    </main>
  );
}
