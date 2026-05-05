"use client";
import { useEffect, useState } from "react";
import { usePageMetadata } from "@/context/pagemetadataContext";
import { useLanguage } from "@/context/languagecontext";
import apiClient from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Globe, ExternalLink, AlertTriangle } from "lucide-react";

// Define types for communities
interface Community {
  _id: string;
  identifier: string;
  Name: string;
  Description: string;
  Members: number;
  Category: string;
  Website?: string;
  Logo?: string;
  Region?: string;
  Activity?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Present when API was called with socialStats=1 */
  socialStats?: { source?: 'live' | 'stored'; telegramUsername?: string | null };
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { setHeading, setTitle, setDescription } = usePageMetadata();
  const { t, language } = useLanguage();

  useEffect(() => {
    setHeading('Pi Network Communities');
    setTitle('Pi Network Communities | Global Pi Network Community');
    setDescription('Discover and connect with Pi Network communities worldwide.');
  }, [setHeading, setTitle, setDescription, language]);

  useEffect(() => {
    loadCommunitiesData();
  }, []);

  const loadCommunitiesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getCommunities();
      
      if (data.success) {
        // Sort communities by members count (largest to smallest)
        const sortedCommunities = (data.data || []).sort((a: Community, b: Community) => b.Members - a.Members);
        setCommunities(sortedCommunities);
      } else {
        throw new Error(data.message || 'Failed to load communities data');
      }
      
    } catch (err) {
      console.error('Error loading communities:', err);
      setError(`Failed to load communities data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Development': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'Regional': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Business': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Education': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Trading': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Community': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Technical': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="white-zone">
        <div className="flex justify-center items-center py-12">
          <Spinner />
          <span className="ml-2 text-muted-foreground">Loading communities...</span>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="white-zone">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-lg flex items-start">
            <AlertTriangle className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Error Loading Communities</h3>
              <p className="text-sm">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-3"
                onClick={loadCommunitiesData}
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalMembers = communities.reduce((sum, community) => sum + community.Members, 0);
  const categories = [...new Set(communities.map(c => c.Category))];

  return (
    <div className="white-zone">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Pi Network Communities
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect with Pi Network communities worldwide and be part of the growing ecosystem.
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full p-3 bg-emerald-100 dark:bg-emerald-900/20 mr-4">
                <Users size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h6 className="text-muted-foreground text-sm mb-1">Total Communities</h6>
                <h3 className="text-2xl font-bold text-foreground">{communities.length}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full p-3 bg-green-100 dark:bg-green-900/20 mr-4">
                <Globe size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h6 className="text-muted-foreground text-sm mb-1">Total Members</h6>
                <h3 className="text-2xl font-bold text-foreground">{totalMembers.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full p-3 bg-purple-100 dark:bg-purple-900/20 mr-4">
                <Users size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h6 className="text-muted-foreground text-sm mb-1">Categories</h6>
                <h3 className="text-2xl font-bold text-foreground">{categories.length}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
            <CardContent className="flex items-center p-6">
              <div className="rounded-full p-3 bg-orange-100 dark:bg-orange-900/20 mr-4">
                <Globe size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h6 className="text-muted-foreground text-sm mb-1">Avg Members</h6>
                <h3 className="text-2xl font-bold text-foreground">
                  {communities.length > 0 ? Math.round(totalMembers / communities.length).toLocaleString() : '0'}
                </h3>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Communities Table */}
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Users className="h-6 w-6 mr-2" />
              Pi Network Communities ({communities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {communities.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Community</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead className="w-[100px]">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communities.map((community) => (
                      <TableRow key={community._id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-emerald-500 to-purple-600">
                              {community.Logo ? (
                                <img 
                                  src={community.Logo} 
                                  alt={`${community.Name} logo`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    // Fallback to letter circle if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    if (target.parentElement) {
                                      target.parentElement.innerHTML = `<span class="text-white font-bold text-sm">${community.Name.charAt(0)}</span>`;
                                    }
                                  }}
                                />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {community.Name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{community.Name}</div>
                              <div className="text-sm text-muted-foreground max-w-[250px] truncate">
                                {community.Description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getCategoryColor(community.Category)}>
                            {community.Category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-medium">{community.Members.toLocaleString()}</span>
                            {community.socialStats?.source === 'live' && (
                              <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                                Live
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {community.Region || 'Global'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {community.Website && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 px-3"
                              onClick={() => window.open(community.Website, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Join
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Communities Yet</h3>
                <p className="text-muted-foreground">Communities will be listed here as they join the Pi Network ecosystem.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 