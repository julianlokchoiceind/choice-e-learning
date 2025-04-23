import { Metadata } from "next";
import { FAQSection } from "@/components/faq";

export const metadata: Metadata = {
  title: "FAQ | Choice E-Learning",
  description: "Frequently asked questions about our courses, platform, and learning process.",
};

export default function FAQPage() {
  return (
    <>
      {/* Hero Section with Gradient Background */}
      <section className="min-h-[500px] flex items-center justify-center overflow-hidden" 
              style={{ 
                background: 'linear-gradient(180deg, #1e2a78 0%, #0b1120 100%)',
                paddingTop: '100px',
                paddingBottom: '60px'
              }}>
        <div className="max-w-[980px] mx-auto px-4 text-center">
          <h1 className="text-[48px] md:text-[56px] font-bold text-white mb-4 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-[21px] leading-[1.381] text-white/80 max-w-[680px] mx-auto">
            Find answers to the most common questions about our online learning platform.
            If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
      </section>
      
      {/* Dynamic FAQ Section */}
      <div className="bg-gray-50 py-10">
        <FAQSection />
      </div>
      
      {/* Contact Support CTA */}
      <div className="w-full max-w-5xl mx-auto px-4 py-16">
        <div className="w-full text-center rounded-2xl p-10"
             style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #1e40af 100%)' }}>
          <h2 className="text-[32px] font-semibold mb-6 text-white">Still have questions?</h2>
          <p className="mb-8 text-lg text-white/80">Our team is here to help you with any other questions you might have.</p>
          <a 
            href="mailto:support@choice-e-learning.com" 
            className="inline-block px-8 py-4 rounded-full bg-white text-blue-600 font-medium hover:bg-blue-50 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </>
  );
}
