import ProjectDetailWrapper from './ProjectDetailWrapper';
import { Business } from '@/lib/types';

async function getProjectById(id: string): Promise<Business | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const [cexRes, coreTeamRes, generatedRes] = await Promise.all([
      fetch(`${baseUrl}/api/addresses/cex`),
      fetch(`${baseUrl}/api/addresses/core-team`),
      fetch(`${baseUrl}/api/addresses/generated`),
    ]);

    const [cexData, coreTeamData, generatedData] = await Promise.all([
      cexRes.json(),
      coreTeamRes.json(),
      generatedRes.json(),
    ]);

    const processApiData = (data: any[], category: string) => (data || []).map((item: any) => ({
      _id: item._id,
      name: item.Name,
      description: item.Description || '',
      category: category === 'Generated' ? item.Category || 'Generated' : category,
      totalHoldings: 0,
      walletAddress: item.identifier,
      founders: [],
      website: item.Website,
      lastUpdated: item.updatedAt,
      status: 'active',
      marketCap: 0,
      volume24h: 0,
      priceChange24h: 0,
      netPiChange24h: 0,
      logo: item.Logo,
      rank: item.Rank || 0,
    } as Business));

    const allBusinesses = [
      ...processApiData(cexData.data || [], 'CEX'),
      ...processApiData(coreTeamData.data || [], 'Core Team'),
      ...processApiData(generatedData.data || [], 'Generated'),
    ];

    return allBusinesses.find(b => b._id === id) || null;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    const [cexRes, coreTeamRes, generatedRes] = await Promise.all([
      fetch(`${baseUrl}/api/addresses/cex`),
      fetch(`${baseUrl}/api/addresses/core-team`),
      fetch(`${baseUrl}/api/addresses/generated`),
    ]);

    const [cexData, coreTeamData, generatedData] = await Promise.all([
      cexRes.json(),
      coreTeamRes.json(),
      generatedRes.json(),
    ]);

    const allIds = [
      ...(cexData.data || []).map((item: any) => ({ id: item._id })),
      ...(coreTeamData.data || []).map((item: any) => ({ id: item._id })),
      ...(generatedData.data || []).map((item: any) => ({ id: item._id })),
    ];

    return allIds.filter(item => item.id);
  } catch (error) {
    console.error("Failed to fetch project IDs for static generation:", error);
    return [];
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params;

  if (!id) {
    return <div>Error: Invalid project ID</div>;
  }

  const project = await getProjectById(id);

  return <ProjectDetailWrapper id={id} initialProject={project} />;
}
