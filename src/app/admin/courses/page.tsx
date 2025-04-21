import dynamic from 'next/dynamic';

// Dynamically import the Courses Index component with no SSR
// This avoids hydration errors since the component is client-side only
const CoursesIndex = dynamic(() => import('./index'), { ssr: false });

export default function CoursesPage() {
  return <CoursesIndex />;
} 