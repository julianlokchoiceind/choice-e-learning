import { Metadata } from "next";
import { StudentDetail } from "@/components/admin/students/StudentDetail";

export const metadata: Metadata = {
  title: "Student Details - Admin Dashboard",
  description: "View student details in the e-learning platform",
};

export default function StudentDetailPage({ params }: { params: { studentId: string } }) {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Student Details</h1>
      <StudentDetail studentId={params.studentId} />
    </div>
  );
}
