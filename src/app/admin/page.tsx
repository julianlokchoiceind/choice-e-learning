import React from 'react';
import Link from 'next/link';
import { 
  UsersIcon, 
  BookOpenIcon, 
  AcademicCapIcon, 
  CreditCardIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  Squares2X2Icon,
  BellIcon,
  MoonIcon,
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  BanknotesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EnvelopeIcon,
  HomeIcon,
  Cog8ToothIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';

export const metadata = {
  title: 'Admin Dashboard | Choice E-Learning',
  description: 'Manage courses, users, and content on the Choice E-Learning platform',
};

// TypeScript interfaces for component props
interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  active?: boolean;
  hasChildren?: boolean;
}

interface StatsCardProps {
  title: string;
  count: string;
  bgColor: string;
  icon: React.ReactNode;
}

interface StudentItemProps {
  name: string;
  className: string;
  image: string;
}

interface MessageItemProps {
  name: string;
  time: string;
  message: string;
  image: string;
}

interface PerformanceTabProps {
  title: string;
  value: string;
  isActive?: boolean;
}

interface OverviewTabProps {
  label: string;
  isActive?: boolean;
}

export default function AdminDashboardPage() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="p-5 flex items-center border-b border-indigo-600">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white text-indigo-700 font-bold text-xl mr-3">A</div>
          <h1 className="text-xl font-bold text-white">Administrator</h1>
        </div>
        
        <nav className="flex-1 mt-5">
          <div className="px-4">
            <div className="space-y-1">
              <SidebarLink href="/admin" icon={<HomeIcon className="h-5 w-5" />} text="Dashboard" active />
            </div>
            
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-white uppercase tracking-wider">
                Management
              </h3>
              <div className="mt-2 space-y-1">
                <SidebarLink href="/admin/student" icon={<AcademicCapIcon className="h-5 w-5" />} text="Student" hasChildren />
                <SidebarLink href="/admin/teacher" icon={<UsersIcon className="h-5 w-5" />} text="Teacher" hasChildren />
                <SidebarLink href="/admin/courses" icon={<BookOpenIcon className="h-5 w-5" />} text="Courses" hasChildren />
                <SidebarLink href="/admin/calendar" icon={<ClockIcon className="h-5 w-5" />} text="Calendar" hasChildren />
                <SidebarLink href="/admin/chat" icon={<EnvelopeIcon className="h-5 w-5" />} text="Chat" hasChildren />
                <SidebarLink href="/admin/notifications" icon={<BellIcon className="h-5 w-5" />} text="Notifications" hasChildren />
                <SidebarLink href="/admin/settings" icon={<Cog6ToothIcon className="h-5 w-5" />} text="Settings" hasChildren />
              </div>
            </div>
          </div>
        </nav>

        <div className="p-5 border-t border-indigo-600">
          <div className="text-center">
            <p className="text-sm text-indigo-200 mb-2">School Admission Dashboard</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="text-gray-500 focus:outline-none">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              </button>
              <div className="relative ml-4 md:ml-6">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input className="form-input w-full sm:w-64 rounded-md pl-10 pr-4 py-2 border border-gray-300 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder="Search..." />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 focus:outline-none">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="relative">
                <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition">
                  <Image className="h-8 w-8 rounded-full object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User avatar" width={32} height={32} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard 
              title="Students" 
              count="932" 
              bgColor="bg-gradient-to-r from-blue-500 to-blue-600" 
              icon={<AcademicCapIcon className="h-6 w-6 text-white" />} 
            />
            <StatsCard 
              title="Teachers" 
              count="754" 
              bgColor="bg-gradient-to-r from-green-500 to-green-600" 
              icon={<UsersIcon className="h-6 w-6 text-white" />} 
            />
            <StatsCard 
              title="Events" 
              count="40" 
              bgColor="bg-gradient-to-r from-yellow-500 to-yellow-600" 
              icon={<ClockIcon className="h-6 w-6 text-white" />} 
            />
            <StatsCard 
              title="Courses" 
              count="32" 
              bgColor="bg-gradient-to-r from-indigo-500 to-indigo-600" 
              icon={<BookOpenIcon className="h-6 w-6 text-white" />} 
            />
          </div>

          {/* Performance Overview Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* School Performance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">School Performance</h3>
              <div className="flex space-x-6 mb-4">
                <PerformanceTab title="This Week" value="1,245" isActive={true} />
                <PerformanceTab title="Last Week" value="1,356" />
              </div>
              <div className="h-64 relative">
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* This Week Line */}
                  <path 
                    d="M0,180 C50,120 100,160 150,100 C200,40 250,80 300,120 C350,160 400,100 450,120 L450,200 L0,200 Z" 
                    fill="rgba(79, 70, 229, 0.1)" 
                    stroke="rgb(79, 70, 229)" 
                    strokeWidth="2"
                  />
                  {/* Last Week Line */}
                  <path 
                    d="M0,100 C50,140 100,80 150,120 C200,160 250,80 300,40 C350,80 400,160 450,120" 
                    fill="none" 
                    stroke="rgb(249, 115, 22)" 
                    strokeWidth="2"
                  />
                </svg>
                <div className="grid grid-cols-6 gap-4 absolute bottom-0 w-full text-xs text-gray-500">
                  <div className="text-center">Week 01</div>
                  <div className="text-center">Week 02</div>
                  <div className="text-center">Week 03</div>
                  <div className="text-center">Week 04</div>
                  <div className="text-center">Week 05</div>
                  <div className="text-center">Week 06</div>
                </div>
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                  <div>560k</div>
                  <div>480k</div>
                  <div>400k</div>
                  <div>320k</div>
                  <div>240k</div>
                  <div>160k</div>
                </div>
              </div>
            </div>
            
            {/* School Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">School Overview</h3>
              <div className="flex space-x-2 border-b mb-4">
                <OverviewTab label="Week" isActive={true} />
                <OverviewTab label="Month" />
                <OverviewTab label="Year" />
                <OverviewTab label="All" />
              </div>
              <div className="h-64 relative">
                <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="none">
                  {/* Bar Chart */}
                  <rect x="20" y="50" width="20" height="150" fill="rgb(79, 70, 229)" />
                  <rect x="60" y="20" width="20" height="180" fill="rgb(79, 70, 229)" />
                  <rect x="100" y="70" width="20" height="130" fill="rgb(79, 70, 229)" />
                  <rect x="140" y="30" width="20" height="170" fill="rgb(79, 70, 229)" />
                  <rect x="180" y="90" width="20" height="110" fill="rgb(79, 70, 229)" />
                  <rect x="220" y="60" width="20" height="140" fill="rgb(79, 70, 229)" />
                  <rect x="260" y="40" width="20" height="160" fill="rgb(79, 70, 229)" />
                  <rect x="300" y="80" width="20" height="120" fill="rgb(79, 70, 229)" />
                  <rect x="340" y="20" width="20" height="180" fill="rgb(79, 70, 229)" />
                  <rect x="380" y="70" width="20" height="130" fill="rgb(79, 70, 229)" />
                  <rect x="420" y="30" width="20" height="170" fill="rgb(79, 70, 229)" />
                  <rect x="460" y="10" width="20" height="190" fill="rgb(79, 70, 229)" />
                  
                  {/* Revenue Line */}
                  <path 
                    d="M30,120 L70,80 L110,100 L150,60 L190,120 L230,90 L270,50 L310,70 L350,40 L390,120 L430,80 L470,50" 
                    fill="none" 
                    stroke="rgb(34, 197, 94)" 
                    strokeWidth="2"
                  />
                  
                  {/* Active Projects Line */}
                  <path 
                    d="M30,140 L70,100 L110,130 L150,90 L190,150 L230,120 L270,100 L310,140 L350,110 L390,140 L430,120 L470,90" 
                    fill="none" 
                    stroke="rgb(249, 115, 22)" 
                    strokeWidth="2"
                    strokeDasharray="4,4"
                  />
                </svg>
                <div className="grid grid-cols-12 gap-1 absolute bottom-0 w-full text-xs text-gray-500">
                  <div className="text-center">Jan</div>
                  <div className="text-center">Feb</div>
                  <div className="text-center">Mar</div>
                  <div className="text-center">Apr</div>
                  <div className="text-center">May</div>
                  <div className="text-center">Jun</div>
                  <div className="text-center">Jul</div>
                  <div className="text-center">Aug</div>
                  <div className="text-center">Sep</div>
                  <div className="text-center">Oct</div>
                  <div className="text-center">Nov</div>
                  <div className="text-center">Dec</div>
                </div>
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
                  <div>100</div>
                  <div>75</div>
                  <div>50</div>
                  <div>25</div>
                  <div>0</div>
                </div>
                <div className="absolute right-4 top-2 flex items-center text-xs gap-8">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 mr-1"></div>
                    <span>Number of Projects</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                    <span>Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                    <span>Active Projects</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Calendar */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">School Calendar</h3>
              <div className="grid grid-cols-7 gap-1 text-center">
                <div className="p-2 text-sm text-gray-500">Su</div>
                <div className="p-2 text-sm text-gray-500">Mo</div>
                <div className="p-2 text-sm text-gray-500">Tu</div>
                <div className="p-2 text-sm text-gray-500">We</div>
                <div className="p-2 text-sm text-gray-500">Th</div>
                <div className="p-2 text-sm text-gray-500">Fr</div>
                <div className="p-2 text-sm text-gray-500">Sa</div>
                
                {/* Calendar Days - first row */}
                <div className="p-2 text-sm">6</div>
                <div className="p-2 text-sm">7</div>
                <div className="p-2 text-sm">8</div>
                <div className="p-2 text-sm bg-orange-500 text-white rounded-full">9</div>
                <div className="p-2 text-sm">10</div>
                <div className="p-2 text-sm">11</div>
                <div className="p-2 text-sm">12</div>
                
                {/* Calendar Days - second row */}
                <div className="p-2 text-sm">13</div>
                <div className="p-2 text-sm">14</div>
                <div className="p-2 text-sm">15</div>
                <div className="p-2 text-sm">16</div>
                <div className="p-2 text-sm">17</div>
                <div className="p-2 text-sm">18</div>
                <div className="p-2 text-sm">19</div>
                
                {/* Calendar Days - third row */}
                <div className="p-2 text-sm">20</div>
                <div className="p-2 text-sm">21</div>
                <div className="p-2 text-sm">22</div>
                <div className="p-2 text-sm">23</div>
                <div className="p-2 text-sm">24</div>
                <div className="p-2 text-sm">25</div>
                <div className="p-2 text-sm">26</div>
                
                {/* Calendar Days - fourth row */}
                <div className="p-2 text-sm">27</div>
                <div className="p-2 text-sm">28</div>
                <div className="p-2 text-sm">29</div>
                <div className="p-2 text-sm">30</div>
                <div className="p-2 text-sm text-gray-400">1</div>
                <div className="p-2 text-sm text-gray-400">2</div>
                <div className="p-2 text-sm text-gray-400">3</div>
              </div>
            </div>
            
            {/* Teacher Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 col-span-2">
              <h3 className="text-lg font-semibold mb-4">Teacher Details</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Subject
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Qualification
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                        Fees
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap">Harry John</td>
                      <td className="px-4 py-3 whitespace-nowrap">History</td>
                      <td className="px-4 py-3 whitespace-nowrap">B.Tech</td>
                      <td className="px-4 py-3 whitespace-nowrap">$ 18.70</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap">Jack Xarma</td>
                      <td className="px-4 py-3 whitespace-nowrap">Programming</td>
                      <td className="px-4 py-3 whitespace-nowrap">B.Tech</td>
                      <td className="px-4 py-3 whitespace-nowrap">$ 192.70</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap">James</td>
                      <td className="px-4 py-3 whitespace-nowrap">History</td>
                      <td className="px-4 py-3 whitespace-nowrap">B.Com</td>
                      <td className="px-4 py-3 whitespace-nowrap">$ 21.70</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap">James Brown</td>
                      <td className="px-4 py-3 whitespace-nowrap">History</td>
                      <td className="px-4 py-3 whitespace-nowrap">B.Com</td>
                      <td className="px-4 py-3 whitespace-nowrap">$ 15.70</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 whitespace-nowrap">Janny</td>
                      <td className="px-4 py-3 whitespace-nowrap">Basic Algorithm</td>
                      <td className="px-4 py-3 whitespace-nowrap">B.Tech</td>
                      <td className="px-4 py-3 whitespace-nowrap">$ 21.70</td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex items-center justify-between mt-4 px-4">
                  <div className="text-sm text-gray-500">Showing 1 to 8 of 16 entries</div>
                  <div className="flex space-x-1">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center">
                      1
                    </button>
                    <button className="w-8 h-8 text-gray-500 bg-gray-100 rounded-md flex items-center justify-center">
                      2
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Unpaid Student Intuition */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Unpaid Student Intuition</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Name <span className="text-red-500">*</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      ID <span className="text-indigo-600">↕</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Class <span className="text-indigo-600">↕</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Fees <span className="text-indigo-600">↕</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Rank <span className="text-indigo-600">↕</span>
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">
                      Action <span className="text-indigo-600">↕</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <StudentRow 
                    name="Jordan Nico" 
                    id="ID 1234567811" 
                    className="Class VII B" 
                    fees="$ 52,036" 
                    rank="First" 
                    image="/images/students/1.jpg"
                  />
                  <StudentRow 
                    name="Jordan Nico" 
                    id="ID 1234567811" 
                    className="Class VII B" 
                    fees="$ 52,036" 
                    rank="First" 
                    image="/images/students/1.jpg"
                  />
                  <StudentRow 
                    name="Karen Hope" 
                    id="ID 1234567812" 
                    className="Class VII A" 
                    fees="$ 53,036" 
                    rank="First" 
                    image="/images/students/2.jpg"
                  />
                  <StudentRow 
                    name="Karen Hope" 
                    id="ID 1234567812" 
                    className="Class VII A" 
                    fees="$ 53,036" 
                    rank="First" 
                    image="/images/students/2.jpg"
                  />
                  <StudentRow 
                    name="Nadila Adja" 
                    id="ID 1234567813" 
                    className="Class VII B" 
                    fees="$ 54,036" 
                    rank="First" 
                    image="/images/students/3.jpg"
                  />
                </tbody>
              </table>
              <div className="flex items-center justify-between mt-4 px-4">
                <div className="text-sm text-gray-500">Showing 1 to 5 of 10 entries</div>
                <div className="flex space-x-1">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  <button className="w-8 h-8 bg-indigo-600 text-white rounded-md flex items-center justify-center">
                    1
                  </button>
                  <button className="w-8 h-8 text-gray-500 bg-gray-100 rounded-md flex items-center justify-center">
                    2
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Students & Messages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Students */}
            <div className="col-span-2 bg-white rounded-lg shadow-sm p-6 h-[360px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Recent Students</h3>
                <p className="text-sm text-gray-500">You have 456 Students</p>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto">
                <StudentItem 
                  name="Samantha William"
                  className="Class VII A"
                  image="https://randomuser.me/api/portraits/women/67.jpg"
                />
                <StudentItem 
                  name="Tony Soap"
                  className="Class VII B"
                  image="https://randomuser.me/api/portraits/men/91.jpg"
                />
                <StudentItem 
                  name="Karen Hope"
                  className="Web Developer"
                  image="https://randomuser.me/api/portraits/women/44.jpg"
                />
                <StudentItem 
                  name="Jordan Nico"
                  className="Class VII A"
                  image="https://randomuser.me/api/portraits/men/45.jpg"
                />
                <StudentItem 
                  name="Nadila Adja"
                  className="Class VII B"
                  image="https://randomuser.me/api/portraits/women/46.jpg"
                />
              </div>
              <div className="flex justify-center mt-4">
                <button className="px-4 py-2 text-indigo-600 font-medium hover:bg-indigo-50 rounded-md">
                  View More
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm p-6 h-[360px] flex flex-col">
              <h3 className="text-lg font-semibold mb-6">Messages</h3>
              <div className="space-y-4 flex-1 overflow-y-auto">
                <MessageItem 
                  name="Samantha William"
                  time="12:45 PM"
                  message="Lorem ipsum dolor sit"
                  image="https://randomuser.me/api/portraits/women/67.jpg"
                />
                <MessageItem 
                  name="Tony Soap"
                  time="12:45 PM"
                  message="Lorem ipsum dolor sit"
                  image="https://randomuser.me/api/portraits/men/91.jpg"
                />
                <MessageItem 
                  name="Tony Soap"
                  time="12:45 PM"
                  message="Lorem ipsum dolor sit"
                  image="https://randomuser.me/api/portraits/men/91.jpg"
                />
                <MessageItem 
                  name="Jordan Nico"
                  time="12:45 PM"
                  message="Lorem ipsum dolor sit"
                  image="https://randomuser.me/api/portraits/men/45.jpg"
                />
                <MessageItem 
                  name="Nadila Adja"
                  time="12:45 PM"
                  message="Lorem ipsum dolor sit"
                  image="https://randomuser.me/api/portraits/women/46.jpg"
                />
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white py-3 px-6 border-t">
          <div className="text-center text-sm text-gray-500">
            Copyright © Designed & Developed by <a href="https://choiceind.com" className="text-indigo-600 hover:underline">Choiceind.com</a> 2025
          </div>
        </footer>
      </div>
    </div>
  );
}

// Sidebar Link Component
function SidebarLink({ href, icon, text, active = false, hasChildren = false }: SidebarLinkProps) {
  return (
    <Link href={href} className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${active ? 'bg-indigo-800 text-white' : 'text-white hover:bg-indigo-600 hover:text-white'}`}>
      <div className="flex items-center">
        <span className="mr-3">{icon}</span>
        <span>{text}</span>
      </div>
      {hasChildren && (
        <ChevronRightIcon className="h-4 w-4" />
      )}
    </Link>
  );
}

// Stats Card Component
function StatsCard({ title, count, bgColor, icon }: StatsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className={`p-4 ${bgColor}`}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white text-sm font-medium">{title}</p>
            <h3 className="text-white text-2xl font-bold">{count}</h3>
          </div>
          <div className="p-2 rounded-full bg-white/20">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// Student Row Component
interface StudentRowProps {
  name: string;
  id: string;
  className: string;
  fees: string;
  rank: string;
  image: string;
}

function StudentRow({ name, id, className, fees, rank, image }: StudentRowProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
            <Image src={image || "https://randomuser.me/api/portraits/men/1.jpg"} alt={name} width={40} height={40} />
          </div>
          <span className="font-medium">{name}</span>
        </div>
      </td>
      <td className="px-4 py-3 whitespace-nowrap">{id}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full">
          {className}
        </span>
      </td>
      <td className="px-4 py-3 whitespace-nowrap font-medium">{fees}</td>
      <td className="px-4 py-3 whitespace-nowrap text-gray-500">{rank}</td>
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex space-x-2">
          <button className="p-1 bg-gray-100 rounded-md text-gray-500 hover:bg-gray-200">
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button className="p-1 bg-gray-100 rounded-md text-gray-500 hover:bg-gray-200">
            <TrashIcon className="h-5 w-5" />
          </button>
          <button className="p-1 bg-gray-100 rounded-md text-gray-500 hover:bg-gray-200">
            <Cog8ToothIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Student Item Component
function StudentItem({ name, className, image }: StudentItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-200 flex items-center justify-center">
          <Image src={image || "https://randomuser.me/api/portraits/men/1.jpg"} alt={name} width={40} height={40} />
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-gray-500">{className}</p>
        </div>
      </div>
      <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600">
        <EnvelopeIcon className="h-5 w-5" />
      </button>
    </div>
  );
}

// Message Item Component
function MessageItem({ name, time, message, image }: MessageItemProps) {
  return (
    <div className="flex items-start space-x-3">
      <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
        <Image src={image || "https://randomuser.me/api/portraits/men/1.jpg"} alt={name} width={40} height={40} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">{name}</h4>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Performance Tab Component
function PerformanceTab({ title, value, isActive = false }: PerformanceTabProps) {
  return (
    <div className={`${isActive ? 'text-indigo-700' : 'text-gray-500'}`}>
      <div className="flex items-center mb-1">
        <div className={`w-4 h-4 rounded-full mr-2 ${isActive ? 'bg-indigo-700' : 'bg-orange-500'}`}></div>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ label, isActive = false }: OverviewTabProps) {
  return (
    <button 
      className={`px-4 py-2 text-sm ${isActive 
        ? 'text-indigo-700 bg-indigo-50 rounded-t-md border-b-2 border-indigo-700' 
        : 'text-gray-500 hover:text-gray-700'}`}
    >
      {label}
    </button>
  );
} 