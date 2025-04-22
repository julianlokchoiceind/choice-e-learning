import { Metadata } from "next";
import { StudentForm } from "@/components/admin/students/StudentForm";

export const metadata: Metadata = {
  title: "Edit Student - Admin Dashboard",
  description: "Edit student information in the e-learning platform",
};

export default function EditStudentPage({ params }: { params: { studentId: string } }) {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Student</h1>
      <StudentForm studentId={params.studentId} />
    </div>
  );
}
