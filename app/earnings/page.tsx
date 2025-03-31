'use client';

import { useState } from 'react';
import { 
  DollarSign, TrendingUp, ArrowUpRight, Download, Calendar,
  Home, Briefcase, Search, Bell, User, ChevronDown, Menu, Star, Settings
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Transaction {
  id: string;
  jobTitle: string;
  client: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  date: string;
}

const chartData = [
  { name: 'Jan', earnings: 2400 },
  { name: 'Feb', earnings: 1398 },
  { name: 'Mar', earnings: 9800 },
  { name: 'Apr', earnings: 3908 },
  { name: 'May', earnings: 4800 },
  { name: 'Jun', earnings: 3800 },
];

export default function EarningsPage() {
  const menuItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Briefcase className="w-5 h-5" />, label: 'My Jobs', href: '/my-jobs', count: 3 },
    { icon: <Search className="w-5 h-5" />, label: 'Find Jobs', href: '/find-jobs' },
    { icon: <DollarSign className="w-5 h-5" />, label: 'Earnings', href: '/earnings' },
    { icon: <Star className="w-5 h-5" />, label: 'Reviews', href: '/reviews' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings' },
  ];

  const [transactions] = useState<Transaction[]>([
    {
      id: '1',
      jobTitle: 'Bathroom Renovation',
      client: 'Sarah Johnson',
      amount: 2500,
      status: 'completed',
      date: '2024-01-15'
    },
    // Add more transactions...
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">John Doe</h3>
              <p className="text-sm text-green-500">Online</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
                  item.label === 'Earnings'
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.count && (
                  <span className="ml-auto bg-primary/10 text-primary px-2 py-1 rounded-full text-xs">
                    {item.count}
                  </span>
                )}
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6">
          <div className="flex-1 flex items-center gap-4">
            <button className="md:hidden">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Earnings</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-gray-600 hover:text-gray-900">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
              <button className="flex items-center gap-2 text-primary hover:text-primary/90">
                <Download className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">$12,450</p>
              <div className="flex items-center gap-1 text-green-500 text-sm mt-1">
                <ArrowUpRight className="w-4 h-4" />
                <span>12% from last month</span>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Pending Payments</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">$3,200</p>
              <p className="text-sm text-gray-500 mt-1">From 4 jobs</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Available Balance</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">$8,750</p>
              <button className="text-primary text-sm mt-1">Withdraw</button>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500">Jobs Completed</h3>
              <p className="text-2xl font-semibold text-gray-900 mt-2">24</p>
              <p className="text-sm text-gray-500 mt-1">This month</p>
            </div>
          </div>

          {/* Earnings Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="earnings"
                    stroke="#0070f3"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Job</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.jobTitle}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{transaction.client}</td>
                      <td className="py-3 px-4 font-medium text-gray-900">
                        ${transaction.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 