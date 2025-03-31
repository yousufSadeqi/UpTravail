'use client';

import { useState } from 'react';
import { Camera, Upload, Plus } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Expert';
}

export default function ProfileSection() {
  const [skills, setSkills] = useState<Skill[]>([
    { id: '1', name: 'Plumbing', level: 'Expert' },
    { id: '2', name: 'Electrical', level: 'Intermediate' },
  ]);
  const [hourlyRate, setHourlyRate] = useState(45);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
            <button className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full hover:bg-primary/90">
              <Upload className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">John Doe</h2>
                <p className="text-sm text-gray-500">Professional Plumber & Electrician</p>
              </div>
              <button className="btn-primary">Edit Profile</button>
            </div>
            
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-gray-500">Location:</span>
                <span className="ml-1 text-gray-900">New York, USA</span>
              </div>
              <div>
                <span className="text-gray-500">Member since:</span>
                <span className="ml-1 text-gray-900">January 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills & Expertise */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Skills & Expertise</h3>
          <button className="text-primary hover:text-primary/90 text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        </div>
        
        <div className="grid gap-3">
          {skills.map((skill) => (
            <div 
              key={skill.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-900">{skill.name}</h4>
                <p className="text-sm text-gray-500">{skill.level}</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">Edit</button>
            </div>
          ))}
        </div>
      </div>

      {/* Hourly Rate */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hourly Rate</h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="10"
            max="100"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="flex-1"
          />
          <div className="w-20 text-center font-medium text-gray-900">
            ${hourlyRate}/hr
          </div>
        </div>
      </div>

      {/* Portfolio */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Portfolio</h3>
          <button className="text-primary hover:text-primary/90 text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Work
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Sample portfolio items */}
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          {/* Add more portfolio items here */}
        </div>
      </div>
    </div>
  );
} 