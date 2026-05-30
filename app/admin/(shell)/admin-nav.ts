import {
  Briefcase,
  FileText,
  FolderGit2,
  Image as ImageIcon,
  LayoutDashboard,
  Quote,
  User,
  type LucideIcon,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

// Sidebar order matches the SCRUM-65 acceptance criteria. The resource pages
// (everything past Dashboard) land in later F11+ stories; the links are wired
// now so the shell nav is complete.
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Posts", href: "/admin/posts", icon: FileText },
  { label: "Projects", href: "/admin/projects", icon: FolderGit2 },
  { label: "Experience", href: "/admin/experience", icon: Briefcase },
  { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
  { label: "Assets", href: "/admin/assets", icon: ImageIcon },
  { label: "Profile", href: "/admin/profile", icon: User },
];

// Dashboard ("/admin") matches exactly so it isn't lit up on every child route;
// the rest match on prefix so a nested editor still highlights its section.
export function isAdminActive(href: string, pathname: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}
