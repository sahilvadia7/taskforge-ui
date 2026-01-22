"use client";

import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

export default function DashboardPage() {
    const { data: session } = useSession();
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-black">
            {/* SIDEBAR (Simple Mock) */}
            <aside className="w-64 bg-white shadow-md dark:bg-zinc-900 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">{slug}</h2>
                </div>
                <nav className="mt-6">
                    <a href="#" className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-200 border-r-4 border-indigo-600">
                        <span className="font-medium">Dashboard</span>
                    </a>
                    <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800">
                        <span className="font-medium">Projects</span>
                    </a>
                    <a href="#" className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-zinc-800">
                        <span className="font-medium">Team</span>
                    </a>
                </nav>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {session?.user?.name || session?.user?.email}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                            Tenant: {slug}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* STAT CARDS */}
                    {["Total Projects", "Active Tasks", "Team Members"].map((title, i) => (
                        <div key={i} className="rounded-xl bg-white p-6 shadow dark:bg-zinc-900">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{Math.floor(Math.random() * 20) + 1}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
