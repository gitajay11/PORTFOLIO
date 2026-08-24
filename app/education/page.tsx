import type { Metadata } from "next";
import EducationHub from "@/components/EducationHub";

export const metadata: Metadata = {
  title: "Education",
  description: "Ajay's qualifications and completed certifications.",
};

export default function EducationPage() {
  return (
    <main className="page">
      <EducationHub />
    </main>
  );
}
