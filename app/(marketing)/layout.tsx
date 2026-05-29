import { Navbar } from "@/components/site/navbar";
import { SiteFooter } from "@/components/site/site-footer";

// Layout for the public marketing routes (home, blog, projects, about,
// contact). Carries the persistent navbar + footer. Admin routes intentionally
// live outside this group so they don't inherit the public chrome.
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </>
  );
}
