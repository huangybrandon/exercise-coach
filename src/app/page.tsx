import AuthGate from "@/components/AuthGate";
import HomeDashboard from "@/components/HomeDashboard";

export default function Home() {
  return (
    <AuthGate>
      <HomeDashboard />
    </AuthGate>
  );
}
