import { Navbar } from "@/components/site/navbar";

// Layout for the public marketing routes (home, blog, projects, about,
// contact). Carries the persistent navbar; footer lands in SCRUM-60. Admin
// routes intentionally live outside this group so they don't inherit the
// public chrome.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
