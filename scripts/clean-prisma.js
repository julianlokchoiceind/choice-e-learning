const fs = require('fs');
const path = require('path');

const prismaDir = path.join(__dirname, '..', 'node_modules', '.prisma');

// Xóa thư mục .prisma nếu tồn tại
if (fs.existsSync(prismaDir)) {
  console.log('Cleaning Prisma directory...');
  fs.rmSync(prismaDir, { recursive: true, force: true });
  console.log('Prisma directory cleaned successfully!');
} else {
  console.log('Prisma directory does not exist, skipping clean...');
} 