const fs = require('fs');
const path = require('path');

// Path to the Prisma client directory
const prismaClientDir = path.join(__dirname, '..', 'node_modules', '.prisma', 'client');

// Check if the directory exists
if (fs.existsSync(prismaClientDir)) {
  console.log(`Cleaning up Prisma client directory: ${prismaClientDir}`);
  
  try {
    // Remove the directory and its contents
    fs.rmSync(prismaClientDir, { recursive: true, force: true });
    console.log('Prisma client directory removed successfully.');
  } catch (error) {
    console.error('Error removing Prisma client directory:', error);
  }
} else {
  console.log('Prisma client directory does not exist. No cleanup needed.');
}

console.log('Cleanup complete.'); 