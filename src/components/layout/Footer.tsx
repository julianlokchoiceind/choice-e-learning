import React from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaDiscord, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#f5f5f7]">
      <div className="max-w-[980px] mx-auto">
        {/* Main footer content */}
        <div className="px-4 py-5 md:py-12">
          <div className="border-b border-[#d2d2d7] pb-5 mb-5">
            <p className="text-[#86868b] text-xs leading-[1.33337] max-w-[640px]">
              Choice E-Learning offers high-quality online courses taught by experienced instructors. 
              Learn at your own pace with hands-on projects and join our community of developers to accelerate your learning journey.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-y-8 gap-x-4 md:gap-x-6">
            <div>
              <h3 className="text-xs leading-[1.33337] font-semibold text-[#1d1d1f] mb-2.5">Learn</h3>
              <ul>
                {['All Courses', 'Challenges', 'Learning Roadmap'].map((item, idx) => (
                  <li key={idx} className="text-xs leading-[1.33337] text-[#424245] py-[0.8rem] md:py-1">
                    <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#0066cc]">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs leading-[1.33337] font-semibold text-[#1d1d1f] mb-2.5">Community</h3>
              <ul>
                {[
                  {name: 'Reviews', href: '/reviews'},
                  {name: 'Discord', href: 'https://discord.com', external: true},
                  {name: 'YouTube', href: 'https://youtube.com', external: true}
                ].map((item, idx) => (
                  <li key={idx} className="text-xs leading-[1.33337] text-[#424245] py-[0.8rem] md:py-1">
                    {item.external ? (
                      <a href={item.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#0066cc]">
                        {item.name}
                      </a>
                    ) : (
                      <Link href={item.href} className="hover:text-[#0066cc]">
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs leading-[1.33337] font-semibold text-[#1d1d1f] mb-2.5">About</h3>
              <ul>
                {['Our Story', 'Instructors', 'Careers'].map((item, idx) => (
                  <li key={idx} className="text-xs leading-[1.33337] text-[#424245] py-[0.8rem] md:py-1">
                    <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="hover:text-[#0066cc]">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs leading-[1.33337] font-semibold text-[#1d1d1f] mb-2.5">Support</h3>
              <ul>
                {[
                  {name: 'FAQ', href: '/faq'},
                  {name: 'Contact Us', href: 'mailto:support@choice-elearning.com', external: true},
                  {name: 'Privacy Policy', href: '/privacy'},
                  {name: 'Terms of Service', href: '/terms'}
                ].map((item, idx) => (
                  <li key={idx} className="text-xs leading-[1.33337] text-[#424245] py-[0.8rem] md:py-1">
                    {item.external ? (
                      <a href={item.href} className="hover:text-[#0066cc]">
                        {item.name}
                      </a>
                    ) : (
                      <Link href={item.href} className="hover:text-[#0066cc]">
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xs leading-[1.33337] font-semibold text-[#1d1d1f] mb-2.5">Connect</h3>
              <div className="flex space-x-3 mb-4 py-[0.8rem] md:py-1">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[#424245] hover:text-[#0066cc] transition-colors">
                  <FaGithub size={16} />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#424245] hover:text-[#0066cc] transition-colors">
                  <FaTwitter size={16} />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-[#424245] hover:text-[#0066cc] transition-colors">
                  <FaDiscord size={16} />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#424245] hover:text-[#0066cc] transition-colors">
                  <FaYoutube size={16} />
                </a>
              </div>
              <p className="text-xs leading-[1.33337] text-[#424245]">Available worldwide</p>
            </div>
          </div>
        </div>

        {/* Copyright section */}
        <div className="px-4 py-3 border-t border-[#d2d2d7]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <p className="text-xs leading-[1.33337] text-[#86868b] order-2 md:order-1 mt-3 md:mt-0">
              Copyright © {new Date().getFullYear()} Choice E-Learning. All rights reserved.
            </p>
            <div className="flex flex-wrap md:flex-nowrap order-1 md:order-2">
              <Link href="/privacy" className="text-xs leading-[1.33337] text-[#424245] hover:text-[#0066cc] mr-4 whitespace-nowrap">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-xs leading-[1.33337] text-[#424245] hover:text-[#0066cc] mr-4 whitespace-nowrap">
                Terms of Use
              </Link>
              <Link href="/sitemap" className="text-xs leading-[1.33337] text-[#424245] hover:text-[#0066cc] whitespace-nowrap">
                Site Map
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 