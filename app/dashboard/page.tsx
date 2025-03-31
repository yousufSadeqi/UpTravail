'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Briefcase, MessageSquare, Star, TrendingUp } from 'lucide-react';

const stats = [
  { name: 'Active Jobs', value: '12', icon: Briefcase, change: '+2.5%', changeType: 'positive' },
  { name: 'Messages', value: '24', icon: MessageSquare, change: '+3.2%', changeType: 'positive' },
  { name: 'Rating', value: '4.8', icon: Star, change: '0%', changeType: 'neutral' },
  { name: 'Earnings', value: '$2,450', icon: TrendingUp, change: '+4.1%', changeType: 'positive' },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex items-center">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p
                      className={`ml-2 text-sm ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : stat.changeType === 'negative'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {stat.change}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {/* Activity items will go here */}
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 