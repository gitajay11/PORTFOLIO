import type { Metadata } from "next";
import Qualification from "@/components/Qualification";

export const metadata: Metadata = {
  title: "Qualification",
  description: "Ajay's school-to-degree education timeline.",
};

export default function QualificationPage() {
  return (
    <main className="page">
      <Qualification />
    </main>
  );
}
