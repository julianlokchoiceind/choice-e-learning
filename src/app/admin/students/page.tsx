import { Metadata } from "next";
import { StudentList } from "@/components/admin/students/StudentList";

export const metadata: Metadata = {
  title: "Students Management - Admin Dashboard",
  description: "Manage all students in the e-learning platform",
};

export default function StudentsPage() {
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Students Management</h1>
      <StudentList />
    </div>
  );
}
