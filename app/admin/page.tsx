import LogoutButton from "./logout-button";

export default function AdminHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <p className="text-sm">
        Resource management lands in later stories — this is the gated shell.
      </p>
      <LogoutButton />
    </main>
  );
}
