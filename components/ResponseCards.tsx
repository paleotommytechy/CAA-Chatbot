
import React from 'react';
import { Course, StudyMaterial, PastQuestion } from '../types';

export const CourseCard: React.FC<{ courses: Course[] }> = ({ courses }) => {
  if (courses.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-3 mt-4">
      {courses.map(course => (
        <div key={course.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="flex justify-between items-start mb-2">
            <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 uppercase tracking-wider">{course.code}</span>
            <span className="text-slate-400 text-[10px] font-medium">{course.units} Units</span>
          </div>
          <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{course.title}</h4>
          <p className="text-slate-500 text-xs mt-1 leading-relaxed line-clamp-2 italic">"{course.description}"</p>
        </div>
      ))}
    </div>
  );
};

export const MaterialCard: React.FC<{ materials: StudyMaterial[] }> = ({ materials }) => {
  if (materials.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
      {materials.map(mat => (
        <a 
          key={mat.id} 
          href={mat.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-white border border-slate-200 p-3 rounded-xl hover:bg-slate-50 hover:border-blue-200 transition-all group"
        >
          <div className={`p-2.5 rounded-lg shrink-0 ${
            mat.type === 'PDF' ? 'bg-red-50 text-red-500' : 
            mat.type === 'Video' ? 'bg-blue-50 text-blue-500' : 
            'bg-amber-50 text-amber-500'
          }`}>
            {mat.type === 'PDF' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
            ) : mat.type === 'Video' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            )}
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-semibold text-slate-700 truncate">{mat.title}</h5>
            <span className="text-[10px] text-slate-400 font-medium group-hover:text-blue-500">Click to access</span>
          </div>
        </a>
      ))}
    </div>
  );
};

export const PQCard: React.FC<{ pqs: PastQuestion[] }> = ({ pqs }) => {
  if (pqs.length === 0) return null;
  return (
    <div className="mt-4 space-y-2">
      {pqs.map(pq => (
        <div key={pq.id} className="flex justify-between items-center bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl hover:bg-indigo-50 transition-colors">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">PREVIOUS PAPER</span>
            <span className="text-xs font-bold text-indigo-900">{pq.year} — {pq.semester} Semester</span>
          </div>
          <button className="text-[10px] font-bold bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all active:scale-95">
            DOWNLOAD
          </button>
        </div>
      ))}
    </div>
  );
};
