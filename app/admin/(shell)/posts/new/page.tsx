import { PostEditor } from "@/components/admin/post-editor";

// New draft. The editor handles the first save (POST) and then swaps the URL to
// the edit route so subsequent saves update the same record.
export default function NewPostPage() {
  return <PostEditor />;
}
