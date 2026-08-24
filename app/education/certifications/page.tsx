import type { Metadata } from "next";
import Certifications from "@/components/Certifications";

export const metadata: Metadata = {
  title: "Certification",
  description: "Ajay's completed certifications.",
};

export default function CertificationsPage() {
  return (
    <main className="page">
      <Certifications />
    </main>
  );
}
