"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface UserStats {
  loginStreak: number;
  percentComplete: number;
  dayCount: number;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<string>("Loading...");
  const [userStats, setUserStats] = useState<UserStats>({
    loginStreak: 2,
    percentComplete: 25,
    dayCount: 16,
  });

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser("Dipankar Atriya");
    }, 500);
  }, []);

  return (
    <div className="p-6">
      {/* Welcome section */}
      <div className="flex items-center justify-between">
        <div className="mb-12">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user}!</h1>
          <p className="text-gray-600">Jump back in, or start something new.</p>
        </div>
        <button
          onClick={() => router.push("/handler/signup")}
          className="border py-2 px-4"
        >
          Login
        </button>
      </div>

      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold text-center">
            {userStats.loginStreak}
          </div>
          <div className="text-sm text-gray-500">
            Your longest login streak is {userStats.dayCount} days
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 relative">
            <svg viewBox="0 0 36 36" className="transform -rotate-90">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#eaeaea"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeDasharray={`${userStats.percentComplete}, 100`}
              />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-xl font-bold">
                {userStats.percentComplete}%
              </div>
              <div className="text-xs text-gray-500">complete</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-full bg-gray-100 rounded-full h-4 mb-2">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: "0%" }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 self-start">
            PUBLIC ACTIVITY
          </div>
        </div>
      </div>

      {/* Feature sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/datasets" legacyBehavior>
          <a className="block border border-gray-200 rounded-md p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3 className="text-center text-lg font-semibold">Datasets</h3>
            <p className="text-center text-sm text-gray-600 mt-2">
              5 total created
            </p>
          </a>
        </Link>

        <Link href="/notebooks" legacyBehavior>
          <a className="block border border-gray-200 rounded-md p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-600"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3 className="text-center text-lg font-semibold">Notebooks</h3>
            <p className="text-center text-sm text-gray-600 mt-2">
              46 total created
            </p>
          </a>
        </Link>

        <Link href="/competitions" legacyBehavior>
          <a className="block border border-gray-200 rounded-md p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-center mb-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-purple-600"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <h3 className="text-center text-lg font-semibold">Competitions</h3>
            <p className="text-center text-sm text-gray-600 mt-2">
              1 total joined
            </p>
          </a>
        </Link>
      </div>

      {/* How to start section */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            How to start: Choose a focus for today
          </h2>
          <button className="text-gray-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Help us make relevant suggestions for you
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-blue-100 via-yellow-100 to-blue-100 p-8">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">
                Learn to compete on TestDev
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Improve and test your skills
              </p>
              <button className="text-sm text-blue-600 font-medium">
                Get started →
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-blue-100 via-green-100 to-blue-100 p-8">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">Take a short course</h3>
              <p className="text-sm text-gray-600 mb-3">
                Our courses are the fastest way to learn data science
              </p>
              <button className="text-sm text-blue-600 font-medium">
                Get started →
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-yellow-100 via-blue-100 to-yellow-100 p-8">
              <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center mb-4 shadow-sm">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-2">
                Browse inspiring data and code
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Improve your data science projects
              </p>
              <button className="text-sm text-blue-600 font-medium">
                Get started →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
