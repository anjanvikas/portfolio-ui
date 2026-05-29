import { Hero } from "@/components/site/hero";
import { FeaturedWork } from "@/components/site/featured-work";
import { ToolsReachFor } from "@/components/site/tools-reach-for";
import { fetchProfile, fetchFeaturedProjects } from "@/lib/api";

export default async function HomePage() {
  const [profile, projects] = await Promise.all([
    fetchProfile(),
    fetchFeaturedProjects(3),
  ]);
  return (
    <>
      <Hero profile={profile} />
      <FeaturedWork projects={projects} />
      <ToolsReachFor />
    </>
  );
}
