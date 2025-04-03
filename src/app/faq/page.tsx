import { Metadata } from "next";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "FAQ | Choice E-Learning",
  description: "Frequently asked questions about our courses, platform, and learning process.",
};

export default function FAQPage() {
  return (
    <>
      {/* Hero Section with Gradient Background */}
      <section className="min-h-[40vh] flex items-center justify-center overflow-hidden" 
              style={{ 
                background: 'linear-gradient(180deg, #000428 0%, #004e92 100%)',
                paddingTop: '120px',
                paddingBottom: '60px'
              }}>
        <div className="max-w-[980px] mx-auto px-4 text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-[21px] leading-[1.381] text-white/80 max-w-[680px] mx-auto">
            Find answers to common questions about our courses, learning methods, and platform features.
          </p>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="card p-6 overflow-hidden shadow-md rounded-xl hover:shadow-lg transition-shadow">
                <details className="group">
                  <summary className="flex justify-between items-center cursor-pointer list-none">
                    <h3 className="font-semibold text-xl text-[#1d1d1f]">{item.question}</h3>
                    <ChevronDownIcon className="w-5 h-5 transition-transform duration-300 group-open:rotate-180 text-[#0066cc]" />
                  </summary>
                  <div className="mt-4 text-[#1d1d1f] text-[17px] leading-relaxed">
                    <p>{item.answer}</p>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-[32px] font-semibold mb-6 text-[#1d1d1f]">Still have questions?</h2>
          <p className="mb-8 text-lg text-[#424245]">Our team is here to help you with any other questions you might have.</p>
          <a 
            href="mailto:support@choice-e-learning.com" 
            className="inline-block px-8 py-4 rounded-full bg-[#0066cc] text-white font-medium hover:bg-[#0055b3] transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </>
  );
}

const faqItems = [
  {
    question: "How do I get started with Choice E-Learning?",
    answer: "Getting started is easy! Simply create an account, browse our course catalog, and enroll in any course that interests you. Once enrolled, you'll have immediate access to the course materials and can start learning at your own pace."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment methods depending on your region. All payments are processed securely through our trusted payment partners."
  },
  {
    question: "Can I access courses on mobile devices?",
    answer: "Yes! Our platform is fully responsive and works on smartphones, tablets, and computers. You can learn on any device with an internet connection, and your progress will sync across all your devices."
  },
  {
    question: "Do courses have deadlines or can I learn at my own pace?",
    answer: "All our courses are self-paced, meaning you can learn whenever it's convenient for you. There are no strict deadlines, allowing you to balance your learning with other commitments. Some courses may have suggested timelines, but these are just recommendations."
  },
  {
    question: "How do I get a certificate after completing a course?",
    answer: "Certificates are automatically issued when you complete all required components of a course. You can download your certificates from your dashboard and share them on your LinkedIn profile or with potential employers."
  },
  {
    question: "What happens if I'm not satisfied with a course?",
    answer: "We offer a 14-day satisfaction guarantee. If you're not happy with your course purchase, contact our support team within 14 days of enrollment, and we'll process a full refund. We want you to be completely satisfied with your learning experience."
  },
  {
    question: "Do you offer any discounts for multiple course purchases?",
    answer: "Yes, we offer bundle discounts when you purchase multiple related courses. We also have seasonal promotions and special offers for returning students. Keep an eye on your email for exclusive discount codes and offers."
  },
  {
    question: "Can I download course materials for offline viewing?",
    answer: "Many of our courses offer downloadable resources like PDFs, worksheets, and exercise files. While video content generally requires an internet connection to stream, these supplementary materials can be downloaded for offline use."
  }
]; 