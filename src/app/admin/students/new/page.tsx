import { Metadata } from "next";
import { StudentForm } from "@/components/admin/students/StudentForm";

export const metadata: Metadata = {
  title: "Add New Student - Admin Dashboard",
  description: "Add a new student to the e-learning platform",
};

export default function NewStudentPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Add New Student</h1>
      <StudentForm />
    </div>
  );
}
