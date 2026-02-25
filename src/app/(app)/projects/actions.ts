'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { ProjectStage } from '@/types/database';

export type CreateProjectInput = {
  name: string;
  owner: string;
  stage: ProjectStage;
  description: string;
};

export async function createProject(input: CreateProjectInput) {
  const supabase = await createClient();

  const { error } = await supabase.from('projects').insert({
    name: input.name,
    owner: input.owner || null,
    stage: input.stage,
    description: input.description || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/projects');
  return { error: null };
}
