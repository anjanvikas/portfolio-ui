import { ProjectEditor } from "@/components/admin/project-editor";

// New draft project. The editor handles the first save (POST) and then swaps the
// URL to the edit route so subsequent saves update the same record.
export default function NewProjectPage() {
  return <ProjectEditor />;
}
