
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function convertFile(filePath) {
  console.log(`Đang chuyển đổi: ${filePath}`);
  
  try {
    let content = await fs.readFile(filePath, 'utf8');
    
    // Chuyển đổi require() sang import
    content = content.replace(
      /const\s+(\w+|\{\s*[\w\s,]+\})\s+=\s+require\(['"]([^'"]+)['"]\);?/g,
      (match, importName, moduleName) => {
        if (importName.startsWith('{')) {
          // Destructuring import
          const names = importName.replace(/[{}]/g, '').trim();
          return `import { ${names} } from '${moduleName}';`;
        } else {
          // Default import
          return `import ${importName} from '${moduleName}';`;
        }
      }
    );
    
    // Chuyển đổi module.exports sang export default
    content = content.replace(
      /module\.exports\s+=\s+/g,
      'export default '
    );
    
    // Chuyển đổi export const X = Y sang export const X = Y
    content = content.replace(
      /exports\.(\w+)\s+=\s+/g,
      'export const $1 = '
    );
    
    await fs.writeFile(filePath, content, 'utf8');
    console.log(`Đã chuyển đổi thành công: ${filePath}`);
    
  } catch (error) {
    console.error(`Lỗi khi chuyển đổi file ${filePath}:`, error);
  }
}

async function main() {
  // Tìm tất cả file JS trong thư mục scripts và các thư mục con
  const files = await globby(['scripts/**/*.js']);
  
  // Chuyển đổi từng file
  for (const file of files) {
    await convertFile(file);
    
    // Đổi tên file .js thành .mjs
    const newPath = file.replace(/\.js$/, '.mjs');
    await fs.rename(file, newPath);
    console.log(`Đổi tên ${file} thành ${newPath}`);
  }
}

main().catch(console.error);