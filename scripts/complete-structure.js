// Script để hoàn thiện cấu trúc và đảm bảo nhất quán trong Choice E-Learning
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

// Đường dẫn gốc của dự án
const rootDir = 'D:/choice-e-learning';

// Danh sách các thành phần cần tạo/điều chỉnh
const missingItems = [
  // Components cho courses
  { 
    type: 'file', 
    path: 'src/client/components/courses/CourseCard.tsx', 
    content: getCourseCardTemplate() 
  },
  { 
    type: 'file', 
    path: 'src/client/components/courses/CourseDetail.tsx', 
    content: getCourseDetailTemplate() 
  },
  { 
    type: 'file', 
    path: 'src/client/components/courses/EnrollButton.tsx', 
    content: getEnrollButtonTemplate() 
  },
  
  // Cập nhật index.ts để re-export
  { 
    type: 'update-index', 
    path: 'src/client/components/courses/index.ts', 
    exports: ['CourseCard', 'CourseDetail', 'CoursesSection', 'EnrollButton'] 
  },
  
  // Di chuyển useAuth.ts vào thư mục auth
  { 
    type: 'move', 
    source: 'src/client/hooks/useAuth.ts', 
    destination: 'src/client/hooks/auth/useAuth.ts' 
  },
  { 
    type: 'update-index', 
    path: 'src/client/hooks/auth/index.ts', 
    exports: ['useAuth'] 
  }
];

// Tạo template cho các file
function getCourseCardTemplate() {
  return `
'use client';

import { useState } from 'react';
import { Course } from '@/shared/types/courses/course';

interface CourseCardProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
}

export const CourseCard = ({ course, onEnroll, isEnrolled = false }: CourseCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleEnroll = async () => {
    if (onEnroll) {
      setIsLoading(true);
      try {
        await onEnroll(course.id);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3>{course.title}</h3>
      </div>
      <div className="course-card-body">
        <p>{course.description}</p>
        {/* Thông tin khác */}
      </div>
      <div className="course-card-footer">
        {!isEnrolled ? (
          <button 
            onClick={handleEnroll} 
            disabled={isLoading}
            className="button primary"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        ) : (
          <a href={\`/courses/\${course.id}\`} className="button outline">
            Tiếp tục học
          </a>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
`;
}

function getCourseDetailTemplate() {
  return `
'use client';

import { Course } from '@/shared/types/courses/course';
import { EnrollButton } from './EnrollButton';

interface CourseDetailProps {
  course: Course;
  isEnrolled?: boolean;
}

export const CourseDetail = ({ course, isEnrolled = false }: CourseDetailProps) => {
  return (
    <div className="course-detail">
      <div className="course-detail-header">
        <h1>{course.title}</h1>
        
        <div className="course-meta">
          <span className="course-level">{course.level}</span>
          <span className="course-duration">{course.duration} phút</span>
        </div>
      </div>
      
      <div className="course-detail-content">
        <div className="course-description">
          <h2>Mô tả khóa học</h2>
          <p>{course.description}</p>
        </div>
        
        {course.lessons && course.lessons.length > 0 && (
          <div className="course-lessons">
            <h2>Nội dung khóa học</h2>
            <ul>
              {course.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <h3>{lesson.title}</h3>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <div className="course-detail-footer">
        <EnrollButton 
          courseId={course.id} 
          isEnrolled={isEnrolled} 
        />
      </div>
    </div>
  );
};

export default CourseDetail;
`;
}

function getEnrollButtonTemplate() {
  return `
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EnrollButtonProps {
  courseId: string;
  isEnrolled?: boolean;
}

export const EnrollButton = ({ courseId, isEnrolled = false }: EnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      // Call API to enroll
      const response = await fetch(\`/api/courses/\${courseId}/enroll\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to enroll');
      }
      
      // Redirect to course page or dashboard
      router.push(\`/learn/\${courseId}\`);
      router.refresh();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isEnrolled) {
    return (
      <a
        href={\`/learn/\${courseId}\`}
        className="button primary full-width"
      >
        Tiếp tục học
      </a>
    );
  }
  
  return (
    <button
      onClick={handleEnroll}
      disabled={isLoading}
      className="button primary full-width"
    >
      {isLoading ? 'Đang xử lý...' : 'Đăng ký khóa học'}
    </button>
  );
};

export default EnrollButton;
`;
}

// Hàm để tạo thư mục nếu chưa tồn tại
async function createDirectoryIfNotExists(dirPath) {
  const fullPath = path.join(rootDir, dirPath);
  if (!await fs.pathExists(fullPath)) {
    await fs.mkdirp(fullPath);
    console.log(`Created directory: ${dirPath}`);
    return true;
  }
  return false;
}

// Hàm để tạo file nếu chưa tồn tại
async function createFileIfNotExists(filePath, content) {
  const fullPath = path.join(rootDir, filePath);
  if (!await fs.pathExists(fullPath)) {
    // Đảm bảo thư mục cha tồn tại
    await fs.mkdirp(path.dirname(fullPath));
    await fs.writeFile(fullPath, content.trim());
    console.log(`Created file: ${filePath}`);
    return true;
  }
  console.log(`File already exists: ${filePath}`);
  return false;
}

// Hàm để cập nhật file index.ts
async function updateIndexFile(indexPath, exports) {
  const fullPath = path.join(rootDir, indexPath);
  
  // Tạo nội dung file index
  const content = exports.map(name => `export * from './${name}';`).join('\n') + '\n';
  
  // Kiểm tra xem file đã tồn tại chưa
  if (await fs.pathExists(fullPath)) {
    // Đọc nội dung hiện tại
    const currentContent = await fs.readFile(fullPath, 'utf8');
    
    // Kiểm tra xem mỗi export có tồn tại trong file chưa
    const missingExports = [];
    for (const exportName of exports) {
      if (!currentContent.includes(`export * from './${exportName}';`)) {
        missingExports.push(exportName);
      }
    }
    
    // Nếu có export bị thiếu, cập nhật file
    if (missingExports.length > 0) {
      const newContent = currentContent.trim() + '\n' + 
        missingExports.map(name => `export * from './${name}';`).join('\n') + '\n';
      
      await fs.writeFile(fullPath, newContent);
      console.log(`Updated index file: ${indexPath} with exports: ${missingExports.join(', ')}`);
      return true;
    }
    
    console.log(`Index file already complete: ${indexPath}`);
    return false;
  } else {
    // Tạo file nếu chưa tồn tại
    // Đảm bảo thư mục cha tồn tại
    await fs.mkdirp(path.dirname(fullPath));
    await fs.writeFile(fullPath, content);
    console.log(`Created index file: ${indexPath}`);
    return true;
  }
}

// Hàm để di chuyển file
async function moveFile(sourcePath, destinationPath) {
  const fullSourcePath = path.join(rootDir, sourcePath);
  const fullDestinationPath = path.join(rootDir, destinationPath);
  
  if (await fs.pathExists(fullSourcePath)) {
    // Đảm bảo thư mục đích tồn tại
    await fs.mkdirp(path.dirname(fullDestinationPath));
    
    // Kiểm tra xem file đích đã tồn tại chưa
    if (!await fs.pathExists(fullDestinationPath)) {
      await fs.move(fullSourcePath, fullDestinationPath);
      console.log(`Moved file from ${sourcePath} to ${destinationPath}`);
      return true;
    } else {
      console.log(`Destination file already exists: ${destinationPath}`);
      return false;
    }
  } else {
    console.log(`Source file does not exist: ${sourcePath}`);
    return false;
  }
}

// Kiểm tra và cập nhật imports sau khi di chuyển file
async function checkAndUpdateImportsAfterMove() {
  const filePatterns = [
    'src/**/*.ts',
    'src/**/*.tsx',
    'src/**/*.js',
    'src/**/*.jsx'
  ];
  
  const importMappings = [
    { 
      from: '@/client/hooks/useAuth', 
      to: '@/client/hooks/auth/useAuth'
    }
  ];
  
  let totalFilesUpdated = 0;
  
  // Lấy danh sách tất cả các file cần kiểm tra
  let allFiles = [];
  for (const pattern of filePatterns) {
    const files = glob.sync(pattern, { cwd: rootDir, absolute: true });
    allFiles = [...allFiles, ...files];
  }
  
  console.log(`Found ${allFiles.length} files to check for imports after move`);
  
  // Cập nhật imports cho từng file
  for (const file of allFiles) {
    try {
      let content = await fs.readFile(file, 'utf8');
      let originalContent = content;
      let hasChanged = false;
      
      // Kiểm tra và cập nhật import statements
      for (const mapping of importMappings) {
        const importRegex = new RegExp(`import\\s+(.+?)\\s+from\\s+['"]${mapping.from}['"]`, 'g');
        const replacedContent = content.replace(importRegex, (match, importClause) => {
          hasChanged = true;
          return `import ${importClause} from '${mapping.to}'`;
        });
        
        if (replacedContent !== content) {
          content = replacedContent;
        }
      }
      
      // Ghi lại file nếu có thay đổi
      if (hasChanged) {
        await fs.writeFile(file, content, 'utf8');
        console.log(`Updated imports in: ${path.relative(rootDir, file)}`);
        totalFilesUpdated++;
      }
    } catch (error) {
      console.error(`Error updating file ${file}:`, error);
    }
  }
  
  console.log(`Updated imports in ${totalFilesUpdated} files after file move`);
  return totalFilesUpdated;
}

// Hàm chính để thực hiện tạo các file và thư mục còn thiếu
async function main() {
  console.log('Starting to complete project structure...');
  
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalMoved = 0;
  
  for (const item of missingItems) {
    try {
      if (item.type === 'file') {
        if (await createFileIfNotExists(item.path, item.content)) {
          totalCreated++;
        }
      } else if (item.type === 'update-index') {
        if (await updateIndexFile(item.path, item.exports)) {
          totalUpdated++;
        }
      } else if (item.type === 'move') {
        if (await moveFile(item.source, item.destination)) {
          totalMoved++;
        }
      }
    } catch (error) {
      console.error(`Error processing ${item.path || item.source}:`, error);
    }
  }
  
  // Cập nhật imports sau khi di chuyển file
  if (totalMoved > 0) {
    const updatedImports = await checkAndUpdateImportsAfterMove();
    console.log(`Updated imports in ${updatedImports} files after file moves`);
  }
  
  console.log(`\nComplete! Created ${totalCreated} files, updated ${totalUpdated} index files, moved ${totalMoved} files.`);
}

// Chạy script
main().catch(console.error);
