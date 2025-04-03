import { Metadata } from "next";
import Image from "next/image";
import { 
  CodeBracketIcon, 
  TrophyIcon, 
  UserGroupIcon, 
  ClockIcon,
  TagIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "Coding Challenges | Choice E-Learning",
  description: "Test your skills with our coding challenges and compete with other learners.",
};

export default function ChallengesPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="section-heading text-4xl font-bold mb-4">Coding Challenges</h1>
        <p className="text-lg max-w-2xl mx-auto opacity-80">
          Put your skills to the test with our interactive coding challenges and compete with other learners.
        </p>
      </div>
      
      {/* Featured Challenge */}
      <div className="mb-16 overflow-hidden rounded-xl relative">
        <div className="relative h-64 md:h-80">
          <Image 
            src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
            alt="Featured Challenge" 
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80 mix-blend-multiply"></div>
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mb-4">
                Featured Challenge
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Build a Real-time Chat Application</h2>
              <p className="text-white/90 mb-4">Create a functional chat application using WebSockets and React in 48 hours.</p>
              <a href="#" className="inline-flex items-center text-white font-medium hover:underline">
                Join Challenge <ArrowRightIcon className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Challenge Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Challenge Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <a 
              key={index} 
              href={`#${category.id}`} 
              className="card p-4 text-center transition-all"
            >
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${category.bgColor}`}>
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{category.count} challenges</p>
            </a>
          ))}
        </div>
      </div>
      
      {/* Weekly Challenges */}
      <div className="mb-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Weekly Challenges</h2>
          <a href="#" className="text-blue-600 dark:text-blue-400 font-medium flex items-center hover:underline">
            View All <ArrowRightIcon className="w-4 h-4 ml-1" />
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <div key={index} className="card group overflow-hidden">
              <div className="relative h-48">
                <Image 
                  src={challenge.image} 
                  alt={challenge.title}
                  fill
                  className="object-cover transition-transform duration-300"
                />
                <div className={`absolute top-0 left-0 w-full h-full ${challenge.gradient} opacity-60 mix-blend-multiply`}></div>
                <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 rounded-full p-2">
                  <TrophyIcon className={`w-5 h-5 ${challenge.difficulty.color}`} />
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${challenge.difficulty.bgColor} ${challenge.difficulty.textColor}`}>
                    {challenge.difficulty.label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" /> {challenge.timeLimit}
                  </span>
                </div>
                
                <h3 className="font-bold text-lg mb-2">{challenge.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{challenge.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <UserGroupIcon className="w-4 h-4 mr-1" /> {challenge.participants} participants
                  </div>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <TagIcon className="w-4 h-4 mr-1" /> {challenge.category}
                  </div>
                </div>
                
                <a 
                  href="#" 
                  className="block w-full py-2 text-center rounded-lg gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  Take Challenge
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Leaderboard Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Top Challengers This Month</h2>
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Challenges Completed</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {leaderboard.map((entry, index) => (
                <tr key={index} className={index < 3 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${index < 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-900 dark:text-white'}`}>
                      #{index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        <Image
                          src={entry.avatar}
                          alt={entry.name}
                          fill
                          className="rounded-full object-cover"
                        />
                        {index < 3 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
                            <TrophyIcon className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{entry.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">@{entry.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">{entry.challengesCompleted}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{entry.points.toLocaleString()}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-center mt-16">
        <h2 className="text-2xl font-bold mb-4">Ready to challenge yourself?</h2>
        <p className="mb-8 max-w-2xl mx-auto">Join our community of coders and test your skills with our weekly challenges.</p>
        <a 
          href="#" 
          className="inline-block px-8 py-3 rounded-lg gradient-accent text-white font-medium hover:opacity-90 transition-opacity"
        >
          Start Your First Challenge
        </a>
      </div>
    </div>
  );
}

const categories = [
  { id: 'frontend', name: 'Frontend', count: 24, icon: CodeBracketIcon, bgColor: 'bg-blue-500' },
  { id: 'backend', name: 'Backend', count: 18, icon: CodeBracketIcon, bgColor: 'bg-green-500' },
  { id: 'algorithms', name: 'Algorithms', count: 32, icon: CodeBracketIcon, bgColor: 'bg-purple-500' },
  { id: 'design', name: 'UI Design', count: 16, icon: CodeBracketIcon, bgColor: 'bg-pink-500' },
];

const challenges = [
  {
    title: "Build a Weather Dashboard",
    description: "Create a weather dashboard that fetches data from a public API and displays current conditions and forecast.",
    difficulty: { label: "Intermediate", bgColor: "bg-yellow-100", textColor: "text-yellow-800", color: "text-yellow-500" },
    participants: 248,
    timeLimit: "3 days",
    category: "Frontend",
    image: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    gradient: "bg-gradient-to-r from-blue-400 to-teal-500"
  },
  {
    title: "Implement a RESTful API",
    description: "Design and implement a RESTful API with authentication, rate limiting, and proper error handling.",
    difficulty: { label: "Advanced", bgColor: "bg-red-100", textColor: "text-red-800", color: "text-red-500" },
    participants: 164,
    timeLimit: "5 days",
    category: "Backend",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    gradient: "bg-gradient-to-r from-purple-400 to-indigo-500"
  },
  {
    title: "Build a To-Do List App",
    description: "Create a fully functional to-do list application with drag and drop functionality and local storage.",
    difficulty: { label: "Beginner", bgColor: "bg-green-100", textColor: "text-green-800", color: "text-green-500" },
    participants: 312,
    timeLimit: "2 days",
    category: "Frontend",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    gradient: "bg-gradient-to-r from-green-400 to-emerald-500"
  }
];

const leaderboard = [
  {
    name: "Alex Morgan",
    username: "alexcode",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    challengesCompleted: 28,
    points: 8750
  },
  {
    name: "Sarah Johnson",
    username: "sarahdev",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    challengesCompleted: 26,
    points: 8450
  },
  {
    name: "Michael Chen",
    username: "mikedev",
    avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    challengesCompleted: 24,
    points: 7900
  },
  {
    name: "Emma Wilson",
    username: "emmacodes",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    challengesCompleted: 22,
    points: 7200
  },
  {
    name: "James Smith",
    username: "jamesdev",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    challengesCompleted: 19,
    points: 6750
  }
]; 