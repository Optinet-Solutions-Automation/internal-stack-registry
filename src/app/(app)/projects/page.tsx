import { createClient } from '@/lib/supabase/server';
import ProjectsClient from './ProjectsClient';

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      tool_project_mapping(
        tool_id,
        tools(
          id,
          name,
          billing_type,
          status,
          billing_subscriptions(monthly_cost, currency)
        )
      )
    `)
    .order('name') as { data: any[] | null; error: any };

  return <ProjectsClient projects={projects ?? []} />;
}
