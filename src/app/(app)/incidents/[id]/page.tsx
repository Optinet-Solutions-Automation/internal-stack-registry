import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import IncidentDetailClient from './IncidentDetailClient';

export default async function IncidentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: incident } = await supabase
    .from('incident_logs')
    .select('*, tools(id, name, category)')
    .eq('id', params.id)
    .single();

  if (!incident) notFound();

  return <IncidentDetailClient incident={incident as any} />;
}
