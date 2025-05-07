// fix-advanced.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { exec } from 'child_process';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const execPromise = promisify(exec);

// Lấy đường dẫn hiện tại
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Đường dẫn tới thư mục gốc của dự án
const projectRoot = path.resolve('D:/choice-e-learning');

// Các phần mở rộng tệp cần xử lý
const extensions = ['.ts', '.tsx'];

// Các thư mục loại trừ
const excludeDirs = ['node_modules', '.next', '.git'];

/**
 * Hàm tìm tất cả các tệp TypeScript
 */
async function findFiles(dir) {
  try {
    const files = [];
    const entries = await readdir(dir);
    
    for (const entry of entries) {
      if (entry.startsWith('.')) continue;
      
      try {
        const entryPath = path.join(dir, entry);
        const entryStat = await stat(entryPath);
        
        if (entryStat.isDirectory()) {
          if (!excludeDirs.includes(entry)) {
            const subFiles = await findFiles(entryPath);
            files.push(...subFiles);
          }
        } else if (entryStat.isFile() && extensions.includes(path.extname(entry))) {
          files.push(entryPath);
        }
      } catch (err) {
        console.error(`Lỗi khi đọc: ${path.join(dir, entry)}: ${err.message}`);
      }
    }
    
    return files;
  } catch (err) {
    console.error(`Lỗi khi đọc thư mục ${dir}: ${err.message}`);
    return [];
  }
}

/**
 * Hàm sửa lỗi cú pháp trong một file cụ thể
 */
async function fixFile(filePath) {
  try {
    // Đọc nội dung file
    const content = await readFile(filePath, 'utf8');
    
    // Nội dung mới
    let newContent = content;
    
    // 1. Sửa lỗi catch (err) => { ... }
    newContent = newContent.replace(/catch\s*\(([^)]+)\)\s*=>\s*\{/g, 'catch ($1) {');
    
    // 2. Sửa lỗi if/else if (condition) => { ... }
    newContent = newContent.replace(/(\bif|\belse\s+if)\s*\(([^)]+)\)\s*=>\s*\{/g, '$1 ($2) {');
    
    // 3. Sửa lỗi condition && => { ... }
    newContent = newContent.replace(/([^=><!\s]\s*&&)\s*=>\s*\{/g, '$1 {');
    
    // 4. Sửa lỗi forEach/map/filter/etc với arrow function
    newContent = newContent.replace(/(\.\w+\s*\(\s*)\(\s*([^)]*)\s*\)\s*=>\s*\{/g, '$1($2) => {');
    
    // 5. Sửa lỗi trong khai báo hàm
    newContent = newContent.replace(/function\s+\w+\s*\(\s*([^)]*)\s*\)\s*=>\s*\{/g, 'function $1($2) {');
    
    // 6. Sửa lỗi JSX bị thiếu đóng thẻ
    const jsxTagsRegex = /<([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)?)([^>]*?)>([^<]*?)<\/\1>/g;
    newContent = newContent.replace(jsxTagsRegex, (match, tag, attrs, content) => {
      // Kiểm tra xem thuộc tính có đúng định dạng không
      if (attrs.includes('={') && !attrs.includes('={...') && !attrs.includes('={}')) {
        // Sửa lỗi thuộc tính JSX
        const fixedAttrs = attrs.replace(/=\{([^{}]*)\}/g, '={"$1"}');
        return `<${tag}${fixedAttrs}>${content}</${tag}>`;
      }
      return match;
    });
    
    // 7. Sửa lỗi JSX thiếu dấu đóng
    newContent = newContent.replace(/<([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z][A-Za-z0-9]*)?)([^>/]*[^/>])>/g, (match, tag, attrs) => {
      if (!match.endsWith('/>') && !attrs.includes('...')) {
        return `<${tag}${attrs}>`;
      }
      return match;
    });
    
    // Nếu có thay đổi, ghi file
    if (newContent !== content) {
      await writeFile(filePath, newContent, 'utf8');
      return true;
    }
    
    return false;
  } catch (err) {
    console.error(`Lỗi khi xử lý file ${filePath}: ${err.message}`);
    return false;
  }
}

/**
 * Hàm tạo lại Prisma Client
 */
async function regeneratePrisma() {
  try {
    console.log('🔄 Đang tạo lại Prisma Client...');
    await execPromise('npx prisma generate', { cwd: projectRoot });
    console.log('✅ Đã tạo lại Prisma Client thành công');
    return true;
  } catch (error) {
    console.error('❌ Lỗi khi tạo lại Prisma Client:', error.message);
    return false;
  }
}

/**
 * Hàm sửa lỗi từng file một
 */
async function fixSpecificFile(filePath) {
  const relativePath = path.relative(projectRoot, filePath);
  console.log(`🔍 Đang kiểm tra file: ${relativePath}`);
  
  const fixed = await fixFile(filePath);
  
  if (fixed) {
    console.log(`✅ Đã sửa lỗi trong file: ${relativePath}`);
    return true;
  } else {
    console.log(`✓ Không cần sửa file: ${relativePath}`);
    return false;
  }
}

/**
 * Hàm chính để thực hiện việc sửa lỗi
 */
async function fixErrors() {
  console.log('🚀 Bắt đầu quy trình sửa lỗi TypeScript...');
  
  try {
    // Tìm tất cả các file TypeScript
    console.log('🔍 Đang tìm kiếm các file TypeScript...');
    const files = await findFiles(projectRoot);
    console.log(`🔎 Tìm thấy ${files.length} tệp cần kiểm tra.`);
    
    // Sửa lỗi từng file
    let fixedFiles = 0;
    
    for (const file of files) {
      try {
        // Bỏ qua files trong thư mục generated
        if (file.includes('generated/prisma')) continue;
        
        // Sửa file
        const fixed = await fixSpecificFile(file);
        if (fixed) fixedFiles++;
      } catch (err) {
        console.error(`❌ Lỗi khi xử lý file ${file}: ${err.message}`);
      }
    }
    
    console.log(`\n✨ Đã sửa ${fixedFiles} tệp trên tổng số ${files.length} tệp kiểm tra.`);
    
    // Tạo lại Prisma Client để sửa lỗi trong thư mục generated
    const hasPrismaFiles = files.some(file => file.includes('prisma'));
    if (hasPrismaFiles) {
      console.log('\n🔄 Phát hiện files Prisma, tiến hành tạo lại Prisma Client...');
      await regeneratePrisma();
    }
    
    console.log('\n🎉 Hoàn thành quy trình sửa lỗi!');
    console.log('📋 Hãy chạy "npm run type-check" và "npm run build" để kiểm tra kết quả.');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình xử lý:', error);
  }
}

/**
 * Hàm sửa trực tiếp các file có lỗi đã biết
 */
async function fixKnownIssues() {
  console.log('🔧 Đang sửa các file có lỗi đã biết...');
  
  const knownIssues = [
    'src/app/admin/courses/[courseId]/edit/page.tsx',
    'src/app/admin/courses/[courseId]/page.tsx',
    'src/app/admin/courses/new/page.tsx',
    'src/app/admin/courses/page.tsx',
    'src/app/admin/faqs/[faqId]/edit/page.tsx',
    'src/client/components/admin/CourseManager.tsx',
  ];
  
  let fixedCount = 0;
  
  for (const relativePath of knownIssues) {
    const fullPath = path.join(projectRoot, relativePath);
    
    try {
      const exists = await stat(fullPath).catch(() => false);
      if (!exists) {
        console.log(`⚠️ File không tồn tại: ${relativePath}`);
        continue;
      }
      
      const fixed = await fixSpecificFile(fullPath);
      if (fixed) fixedCount++;
    } catch (err) {
      console.error(`❌ Lỗi khi sửa file ${relativePath}: ${err.message}`);
    }
  }
  
  console.log(`✅ Đã sửa ${fixedCount} file trong danh sách lỗi đã biết.`);
}

// Thêm xử lý cho uncaught promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Lỗi không được xử lý:', error);
});

// Thực thi script
console.log('⚡ Bắt đầu thực thi script...');

// Sửa các file cụ thể trước
await fixKnownIssues();

// Sau đó quét và sửa toàn bộ dự án
await fixErrors();