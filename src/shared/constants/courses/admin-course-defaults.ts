export const ADMIN_COURSE_DEFAULTS = {
  title: '', // Để trống để backend tạo title theo định dạng
  description: '', // Để trống để hiển thị placeholder
  price: 0,
  level: 'beginner',
  topics: [],
  imageUrl: '/images/placeholder-course.jpg',
  status: 'draft',
  chapters: [],
  lessons: [{
    title: 'Introduction',
    order: 1,
    videoUrl: '',
    description: '',
    resources: []
  }]
};
