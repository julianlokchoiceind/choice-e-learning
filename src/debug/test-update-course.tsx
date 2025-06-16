'use client';

import { useState } from 'react';
import { useCoursesQuery } from '@/client/hooks/courses';
import { CourseStatus } from '@/shared/types/courses/course';

interface TestUpdateCourseProps {
  courseId: string;
}

export const TestUpdateCourse: React.FC<TestUpdateCourseProps> = ({ courseId }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const { useUpdateCourse } = useCoursesQuery(true);
  const updateCourseMutation = useUpdateCourse();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const testUpdateCourse = async () => {
    addLog('Starting course update test...');
    
    const testData = {
      title: 'Test Course Title - Update',
      description: 'Test course description - Updated',
      price: 0,
      level: 'beginner',
      topics: ['test-topic'],
      imageUrl: '/images/courses/course-placeholder.jpg',
      status: CourseStatus.DRAFT,
    };

    addLog(`Sending update request with data: ${JSON.stringify(testData, null, 2)}`);

    try {
      const result = await updateCourseMutation.mutateAsync({
        id: courseId,
        data: testData
      });
      
      addLog(`Success! Response: ${JSON.stringify(result, null, 2)}`);
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      addLog(`Error details: ${JSON.stringify(error, null, 2)}`);
      
      // Log the full error object structure
      if (error.response) {
        addLog(`Response status: ${error.response.status}`);
        addLog(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      
      if (error.request) {
        addLog(`Request: ${JSON.stringify(error.request, null, 2)}`);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-bold mb-4">Update Course Debug Tool</h3>
      
      <div className="mb-4">
        <button
          onClick={testUpdateCourse}
          disabled={updateCourseMutation.isPending}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {updateCourseMutation.isPending ? 'Testing...' : 'Test Update Course'}
        </button>
      </div>

      <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
        <h4 className="font-semibold mb-2">Debug Logs:</h4>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Click the test button to start.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 text-sm font-mono">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TestUpdateCourse;