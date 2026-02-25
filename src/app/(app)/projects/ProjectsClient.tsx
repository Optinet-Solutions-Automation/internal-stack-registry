'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ProjectStage } from '@/types/database';
import AddProjectModal from './AddProjectModal';

type ProjectWithTools = {
  id: string;
  name: string;
  owner: string | null;
  stage: ProjectStage;
  description: string | null;
  created_at: string;
  tool_project_mapping: {
    tool_id: string;
    tools: {
      id: string;
      name: string;
      billing_type: string;
      status: string;
      billing_subscriptions: { monthly_cost: number; currency: string }[];
    } | null;
  }[];
};

const STAGE_CLS: Record<ProjectStage, string> = {
  planning:    'bg-gray-800 text-gray-400',
  active:      'bg-green-900 text-green-300',
  maintenance: 'bg-yellow-900 text-yellow-300',
  archived:    'bg-gray-800 text-gray-500',
};

function calcMonthlyCost(project: ProjectWithTools): number {
  return project.tool_project_mapping.reduce((sum, m) => {
    const tool = m.tools;
    if (!tool || tool.status !== 'active') return sum;
    const sub = tool.billing_subscriptions?.[0];
    return sum + (sub?.monthly_cost ?? 0);
  }, 0);
}

export default function ProjectsClient({ projects }: { projects: ProjectWithTools[] }) {
  const [showModal, setShowModal] = useState(false);
  const [filterStage, setFilterStage] = useState('');

  const filtered = projects.filter(p => !filterStage || p.stage === filterStage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="mt-1 text-sm text-gray-400">{projects.length} projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={filterStage}
          onChange={e => setFilterStage(e.target.value)}
          className="bg-gray-900 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
        >
          <option value="">All Stages</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="maintenance">Maintenance</option>
          <option value="archived">Archived</option>
        </select>

        {filterStage && (
          <button
            onClick={() => setFilterStage('')}
            className="text-sm text-gray-400 hover:text-white px-3 py-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Project</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stage</th>
              <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tools</th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Est. Monthly Cost</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-500">No projects found</td>
              </tr>
            ) : (
              filtered.map(project => {
                const toolCount = project.tool_project_mapping.length;
                const monthlyCost = calcMonthlyCost(project);
                return (
                  <tr key={project.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{project.name}</p>
                      {project.description && (
                        <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{project.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400">{project.owner ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STAGE_CLS[project.stage]}`}>
                        {project.stage}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center text-gray-300">{toolCount}</td>
                    <td className="px-5 py-4 text-right text-gray-300">
                      {monthlyCost > 0 ? `USD ${monthlyCost.toFixed(2)}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && <AddProjectModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
