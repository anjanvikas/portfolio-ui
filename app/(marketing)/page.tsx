import { Hero } from "@/components/site/hero";
import { fetchProfile } from "@/lib/api";

export default async function HomePage() {
  const profile = await fetchProfile();
  return <Hero profile={profile} />;
}
