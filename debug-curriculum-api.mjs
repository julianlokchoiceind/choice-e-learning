#!/usr/bin/env node

/**
 * Debug script to test the curriculum API directly
 */

const COURSE_ID = '6850cca10c984d3f25bd7ad0';
const API_URL = `http://localhost:3000/api/admin/courses/${COURSE_ID}/curriculum`;

const sampleCurriculumData = {
  chapters: [
    {
      id: 'temp-chapter-1',
      title: 'Introduction to Testing',
      description: 'Learn the basics of software testing and debugging',
      order: 1
    }
  ],
  lessons: [
    {
      id: 'temp-lesson-1',
      title: 'Getting Started with Unit Tests',
      content: '',
      videoUrl: '',
      order: 1,
      chapterId: 'temp-chapter-1'
    }
  ]
};

async function testCurriculumAPI() {
  try {
    console.log('=== TESTING CURRICULUM API ===');
    console.log('URL:', API_URL);
    console.log('Data:', JSON.stringify(sampleCurriculumData, null, 2));
    
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'next-auth.session-token=mock-token' // Mock auth
      },
      body: JSON.stringify(sampleCurriculumData)
    });
    
    console.log('=== RESPONSE STATUS ===');
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('=== RESPONSE BODY ===');
    console.log(responseText);
    
    if (!response.ok) {
      console.error('=== ERROR DETECTED ===');
      console.error('Status:', response.status);
      console.error('Response:', responseText);
    }
    
  } catch (error) {
    console.error('=== FETCH ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCurriculumAPI();