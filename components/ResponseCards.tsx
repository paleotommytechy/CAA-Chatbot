
import React from 'react';
import { Course, StudyMaterial, PastQuestion } from '../types';

export const CourseCard: React.FC<{ courses: Course[] }> = ({ courses }) => (
  <div className="grid grid-cols-1 gap-3 mt-4">
    {courses.map(course => (
      <div key={course.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">{course.code}</span>
          <span className="text-slate-500 text-xs">{course.units} Units</span>
        </div>
        <h4 className="font-semibold text-slate-800 text-sm">{course.title}</h4>
        <p className="text-slate-600 text-xs mt-1 line-clamp-2">{course.description}</p>
      </div>
    ))}
  </div>
);

export const MaterialCard: React.FC<{ materials: StudyMaterial[] }> = ({ materials }) => (
  <div className="flex flex-wrap gap-2 mt-4">
    {materials.map(mat => (
      <div key={mat.id} className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-lg flex-1 min-w-[200px]">
        <div className={`p-2 rounded-lg ${mat.type === 'PDF' ? 'bg-red-50 text-red-500' : mat.type === 'Video' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
          {mat.type === 'PDF' ? '📄' : mat.type === 'Video' ? '🎥' : '📝'}
        </div>
        <div>
          <h5 className="text-xs font-medium text-slate-700">{mat.title}</h5>
          <a href={mat.url} className="text-[10px] text-blue-600 hover:underline">Download {mat.type}</a>
        </div>
      </div>
    ))}
  </div>
);

export const PQCard: React.FC<{ pqs: PastQuestion[] }> = ({ pqs }) => (
  <div className="mt-4 space-y-2">
    {pqs.map(pq => (
      <div key={pq.id} className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-3 rounded-lg">
        <span className="text-xs font-bold text-indigo-700">{pq.year} {pq.semester} Semester</span>
        <a href={pq.url} className="text-[10px] bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors">Open PDF</a>
      </div>
    ))}
  </div>
);
