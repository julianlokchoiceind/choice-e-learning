// Debug script to test the update course API directly
const testUpdateCourse = async () => {
  const courseId = 'YOUR_COURSE_ID'; // Replace with actual course ID
  
  const testData = {
    title: 'Test Course Title',
    description: 'Test course description',
    price: 0,
    level: 'beginner',
    topics: [],
    imageUrl: '/images/courses/course-placeholder.jpg',
    status: 'draft'
  };

  try {
    const response = await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      credentials: 'include' // Include cookies for authentication
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed response data:', data);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    } else {
      console.error('Request failed with status:', response.status);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Call the test function
testUpdateCourse();