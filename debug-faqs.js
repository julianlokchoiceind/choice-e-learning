const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking FAQ categories in database...');
    
    const faqs = await prisma.fAQ.findMany({
      select: {
        id: true,
        question: true,
        category: true,
        isActive: true
      }
    });
    
    console.log('All FAQs:', JSON.stringify(faqs, null, 2));
    
    const categories = [...new Set(faqs.map(faq => faq.category))];
    console.log('Distinct categories found:', categories);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();