'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Users, Star, ExternalLink, Globe, 
  Calendar, MapPin, Trophy, Clock, DollarSign, 
  Award, UserCheck, Gift, Code, Palette, 
  GraduationCap, ShoppingBag, Mic 
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

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
  socialStats?: { source?: 'live' | 'stored'; telegramUsername?: string | null };
}

interface Influencer {
  _id: string;
  identifier: string;
  Name: string;
  Description: string;
  Followers: number;
  Platform: string;
  Website?: string;
  Logo?: string;
  Region?: string;
  Category?: string;
  Engagement?: string;
  createdAt?: string;
  updatedAt?: string;
  socialStats?: { source?: 'live' | 'stored'; twitterUsername?: string | null };
}

interface Event {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: 'upcoming' | 'past';
  category: 'launch' | 'hackathon' | 'community' | 'university' | 'celebration' | 'commerce' | 'conference';
  link?: string;
  organizer?: string;
  participants?: number;
  achievements?: string[];
  highlights?: string[];
}

interface Hackathon {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  prizePool: string;
  participants?: number;
  submissions?: number;
  link?: string;
  organizer?: string;
  theme?: string;
  winners?: string[];
  highlights?: string[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getCommunityCategoryColor = (category: string) => {
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

const getInfluencerCategoryColor = (category: string) => {
  switch (category) {
    case 'Official': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'Founder': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'Media': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'Community Leader': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    case 'Regional Leader': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'Educator': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400';
    case 'Business Leader': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getEngagementColor = (engagement: string) => {
  switch (engagement) {
    case 'Very High': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    case 'High': return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20';
    case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
  }
};

const getEventCategoryIcon = (category: string) => {
  switch (category) {
    case 'launch': return <Gift className="w-5 h-5" />;
    case 'hackathon': return <Trophy className="w-5 h-5" />;
    case 'community': return <Palette className="w-5 h-5" />;
    case 'university': return <GraduationCap className="w-5 h-5" />;
    case 'celebration': return <Calendar className="w-5 h-5" />;
    case 'commerce': return <ShoppingBag className="w-5 h-5" />;
    case 'conference': return <Mic className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
};

const getEventCategoryColor = (category: string) => {
  switch (category) {
    case 'launch': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    case 'hackathon': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    case 'community': return 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400';
    case 'university': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'celebration': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'commerce': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'conference': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getEventStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'past': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

const getHackathonStatusIcon = (status: string) => {
  switch (status) {
    case 'upcoming': return <Clock className="w-5 h-5" />;
    case 'ongoing': return <Code className="w-5 h-5" />;
    case 'completed': return <Trophy className="w-5 h-5" />;
    default: return <Calendar className="w-5 h-5" />;
  }
};

const getHackathonStatusColor = (status: string) => {
  switch (status) {
    case 'upcoming': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
    case 'ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  }
};

// ============================================================================
// COMMUNITIES TAB COMPONENT
// ============================================================================

const CommunitiesTab = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    loadCommunitiesData();
  }, []);

  const loadCommunitiesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getCommunities();
      
      if (data.success) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const totalMembers = communities.reduce((sum, community) => sum + community.Members, 0);
  const categories = [...new Set(communities.map(c => c.Category))];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/20 mr-3 sm:mr-4">
              <Users size={20} className="sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Total Communities</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">{communities.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 mr-3 sm:mr-4">
              <Globe size={20} className="sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Total Members</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">{totalMembers.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 mr-3 sm:mr-4">
              <Users size={20} className="sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Categories</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">{categories.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 mr-3 sm:mr-4">
              <Globe size={20} className="sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Avg Members</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">
                {communities.length > 0 ? Math.round(totalMembers / communities.length).toLocaleString() : '0'}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Communities Table */}
      <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-xl">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Communities ({communities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {communities.length > 0 ? (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Community</TableHead>
                    {!isMobile && <TableHead className="text-xs sm:text-sm whitespace-nowrap">Category</TableHead>}
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Members</TableHead>
                    {!isMobile && <TableHead className="text-xs sm:text-sm whitespace-nowrap">Region</TableHead>}
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {communities.map((community) => (
                    <TableRow key={community._id} className="hover:bg-muted/50">
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-emerald-500 to-purple-600 flex-shrink-0">
                            {community.Logo ? (
                              <img 
                                src={community.Logo} 
                                alt={`${community.Name} logo`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-bold text-xs sm:text-sm">
                                {community.Name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">{community.Name}</div>
                            <div className="text-xs text-muted-foreground max-w-[150px] sm:max-w-[250px] truncate">
                              {community.Description}
                            </div>
                            {isMobile && (
                              <Badge className={`${getCommunityCategoryColor(community.Category)} text-xs mt-1`}>
                                {community.Category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="text-xs sm:text-sm">
                          <Badge className={getCommunityCategoryColor(community.Category)}>
                            {community.Category}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{community.Members.toLocaleString()}</span>
                          {community.socialStats?.source === 'live' && (
                            <span className="text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                              Live
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="text-xs sm:text-sm">
                          <span className="text-muted-foreground">
                            {community.Region || 'Global'}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="text-xs sm:text-sm">
                        {community.Website && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
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
            <div className="text-center py-8 sm:py-12">
              <Users className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">No Communities Yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Communities will be listed here as they join the Pi Network ecosystem.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// EVENTS TAB COMPONENT
// ============================================================================

const EventsTab = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ecosystem?type=events');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setEvents(data.data || []);
      } else {
        setEvents([]);
      }
      
    } catch (err) {
      console.error('Error loading events:', err);
      setError(`Failed to load events data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateRange = (startDate: string, endDate?: string) => {
    if (!endDate) return formatDate(startDate);
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const upcomingEvents = events.filter(event => event.type === 'upcoming');
  const pastEvents = events.filter(event => event.type === 'past');
  const totalParticipants = events.reduce((sum, event) => sum + (event.participants || 0), 0);
  const categories = ['all', ...Array.from(new Set(events.map(e => e.category)))];
  
  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{upcomingEvents.length}</div>
          <div className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">Upcoming</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{pastEvents.length}</div>
          <div className="text-xs sm:text-sm text-green-800 dark:text-green-300">Historical</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{events.length}</div>
          <div className="text-xs sm:text-sm text-purple-800 dark:text-purple-300">Total Events</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{totalParticipants > 0 ? `${Math.round(totalParticipants / 1000)}k+` : '∞'}</div>
          <div className="text-xs sm:text-sm text-orange-800 dark:text-orange-300">Participants</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize text-xs sm:text-sm"
          >
            {category === 'all' ? 'All Events' : category}
          </Button>
        ))}
      </div>

      {/* Events Timeline */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Event Timeline</h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {sortedEvents.map((event) => (
            <div key={event.id} className="relative flex items-start mb-6 sm:mb-8">
              {/* Timeline Dot */}
              <div className={`absolute left-4 sm:left-6 w-4 h-4 rounded-full border-2 border-background ${
                event.type === 'upcoming' ? 'bg-emerald-500' : 'bg-gray-400'
              } z-10`}></div>
              
              {/* Event Content */}
              <div className="ml-12 sm:ml-16 w-full">
                <div className="bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
                  {/* Event Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${getEventCategoryColor(event.category)}`}>
                          {getEventCategoryIcon(event.category)}
                        </div>
                        <h3 className="text-base sm:text-xl font-semibold text-foreground">{event.title}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">{event.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={`${getEventStatusColor(event.type)} text-xs`}>
                        {event.type}
                      </Badge>
                      <Badge className={`${getEventCategoryColor(event.category)} text-xs`}>
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Event Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formatDateRange(event.date, event.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    {event.organizer && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{event.organizer}</span>
                      </div>
                    )}
                    {event.participants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        {event.participants.toLocaleString()} participants
                      </div>
                    )}
                  </div>

                  {/* Achievements */}
                  {event.achievements && event.achievements.length > 0 && (
                    <div className="mb-3 sm:mb-4">
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Key Achievements
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {event.achievements.map((achievement, idx) => (
                          <div key={`achievement-${event.id}-${idx}`} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                            <span>{achievement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {event.highlights && event.highlights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-2">Event Highlights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {event.highlights.map((highlight, idx) => (
                          <div key={`highlight-${event.id}-${idx}`} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Calendar className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">No Events Found</h3>
          <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your filter or check back for new events!</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// HACKATHONS TAB COMPONENT
// ============================================================================

const HackathonsTab = () => {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  useEffect(() => {
    loadHackathonsData();
  }, []);

  const loadHackathonsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/ecosystem?type=hackathons');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setHackathons(data.data || []);
      } else {
        setHackathons([]);
      }
      
    } catch (err) {
      console.error('Error loading hackathons:', err);
      setError(`Failed to load hackathons data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (dateString === 'Ongoing') return 'Ongoing';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    if (endDate === 'Ongoing') return `${formatDate(startDate)} - Ongoing`;
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const upcomingHackathons = hackathons.filter(h => h.status === 'upcoming');
  const ongoingHackathons = hackathons.filter(h => h.status === 'ongoing');
  const completedHackathons = hackathons.filter(h => h.status === 'completed');
  const totalParticipants = hackathons.reduce((sum, h) => sum + (h.participants || 0), 0);
  const totalSubmissions = hackathons.reduce((sum, h) => sum + (h.submissions || 0), 0);
  const statuses = ['all', 'upcoming', 'ongoing', 'completed'];
  
  const filteredHackathons = selectedStatus === 'all' 
    ? hackathons 
    : hackathons.filter(h => h.status === selectedStatus);

  const sortedHackathons = [...filteredHackathons].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/10 dark:to-emerald-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{hackathons.length}</div>
          <div className="text-xs sm:text-sm text-emerald-800 dark:text-emerald-300">Total Hackathons</div>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{ongoingHackathons.length}</div>
          <div className="text-xs sm:text-sm text-green-800 dark:text-green-300">Ongoing</div>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{totalParticipants.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-purple-800 dark:text-purple-300">Participants</div>
        </div>
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-800/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">{totalSubmissions.toLocaleString()}</div>
          <div className="text-xs sm:text-sm text-orange-800 dark:text-orange-300">Submissions</div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {statuses.map((status) => (
          <Button
            key={status}
            variant={selectedStatus === status ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedStatus(status)}
            className="capitalize text-xs sm:text-sm"
          >
            {status === 'all' ? 'All Hackathons' : status}
          </Button>
        ))}
      </div>

      {/* Hackathons Timeline */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8">Hackathon Timeline</h2>
        
        <div className="relative max-w-4xl mx-auto">
          {/* Timeline Line */}
          <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-0.5 bg-border"></div>
          
          {sortedHackathons.map((hackathon) => (
            <div key={hackathon.id} className="relative flex items-start mb-6 sm:mb-8">
              {/* Timeline Dot */}
              <div className={`absolute left-4 sm:left-6 w-4 h-4 rounded-full border-2 border-background ${
                hackathon.status === 'ongoing' ? 'bg-green-500' : 
                hackathon.status === 'upcoming' ? 'bg-emerald-500' : 'bg-gray-400'
              } z-10`}></div>
              
              {/* Hackathon Content */}
              <div className="ml-12 sm:ml-16 w-full">
                <div className="bg-gradient-to-r from-card/50 to-card/80 backdrop-blur-sm border border-border/50 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
                  {/* Hackathon Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${getHackathonStatusColor(hackathon.status)}`}>
                          {getHackathonStatusIcon(hackathon.status)}
                        </div>
                        <h3 className="text-base sm:text-xl font-semibold text-foreground">{hackathon.title}</h3>
                      </div>
                      <p className="text-sm sm:text-base text-muted-foreground">{hackathon.description}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={`${getHackathonStatusColor(hackathon.status)} text-xs`}>
                        {hackathon.status}
                      </Badge>
                      {hackathon.theme && (
                        <Badge variant="outline" className="text-xs">
                          {hackathon.theme}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Hackathon Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formatDateRange(hackathon.startDate, hackathon.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{hackathon.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{hackathon.prizePool}</span>
                    </div>
                    {hackathon.organizer && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{hackathon.organizer}</span>
                      </div>
                    )}
                    {hackathon.participants && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        {hackathon.participants.toLocaleString()} participants
                      </div>
                    )}
                    {hackathon.submissions && (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 flex-shrink-0" />
                        {hackathon.submissions.toLocaleString()} submissions
                      </div>
                    )}
                  </div>

                  {/* Winners */}
                  {hackathon.winners && hackathon.winners.length > 0 && (
                    <div className="mb-3 sm:mb-4">
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-2 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Winners & Results
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {hackathon.winners.map((winner, idx) => (
                          <div key={`winner-${hackathon.id}-${idx}`} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
                            <span>{winner}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights */}
                  {hackathon.highlights && hackathon.highlights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm text-foreground mb-2">Key Highlights</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {hackathon.highlights.map((highlight, idx) => (
                          <div key={`highlight-${hackathon.id}-${idx}`} className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
                            <span>{highlight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredHackathons.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Trophy className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">No Hackathons Found</h3>
          <p className="text-sm sm:text-base text-muted-foreground">Try adjusting your filter or check back for new hackathons!</p>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// INFLUENCERS TAB COMPONENT
// ============================================================================

const InfluencersTab = () => {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    loadInfluencersData();
  }, []);

  const loadInfluencersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await apiClient.getInfluencers();
      
      if (data.success) {
        const sortedInfluencers = (data.data || []).sort((a: Influencer, b: Influencer) => b.Followers - a.Followers);
        setInfluencers(sortedInfluencers);
      } else {
        throw new Error(data.message || 'Failed to load influencers data');
      }
      
    } catch (err) {
      console.error('Error loading influencers:', err);
      setError(`Failed to load influencers data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }

  const totalFollowers = influencers.reduce((sum, influencer) => sum + influencer.Followers, 0);
  const categories = [...new Set(influencers.map(c => c.Category))];
  const platforms = [...new Set(influencers.map(c => c.Platform))];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/20 mr-3 sm:mr-4">
              <Star size={20} className="sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Total Influencers</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">{influencers.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-green-100 dark:bg-green-900/20 mr-3 sm:mr-4">
              <Users size={20} className="sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Total Followers</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">{totalFollowers.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/20 mr-3 sm:mr-4">
              <UserCheck size={20} className="sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Categories</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">{categories.length}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
          <CardContent className="flex items-center p-4 sm:p-6">
            <div className="rounded-full p-2 sm:p-3 bg-orange-100 dark:bg-orange-900/20 mr-3 sm:mr-4">
              <Globe size={20} className="sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h6 className="text-muted-foreground text-xs sm:text-sm mb-1">Platforms</h6>
              <h3 className="text-lg sm:text-2xl font-bold text-foreground">{platforms.length}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Influencers Table */}
      <Card className="bg-card/80 backdrop-blur-sm border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center text-base sm:text-xl">
            <Star className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
            Influencers ({influencers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {influencers.length > 0 ? (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Influencer</TableHead>
                    {!isMobile && <TableHead className="text-xs sm:text-sm whitespace-nowrap">Category</TableHead>}
                    {!isMobile && <TableHead className="text-xs sm:text-sm whitespace-nowrap">Platform</TableHead>}
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Followers</TableHead>
                    {!isMobile && <TableHead className="text-xs sm:text-sm whitespace-nowrap">Engagement</TableHead>}
                    <TableHead className="text-xs sm:text-sm whitespace-nowrap">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {influencers.map((influencer) => (
                    <TableRow key={influencer._id} className="hover:bg-muted/50">
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-emerald-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm overflow-hidden flex-shrink-0">
                            {influencer.Logo ? (
                              <img src={influencer.Logo} alt={influencer.Name} className="w-full h-full object-cover" />
                            ) : (
                              influencer.Name.charAt(0)
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-foreground truncate">{influencer.Name}</div>
                            <div className="text-xs text-muted-foreground max-w-[150px] sm:max-w-[250px] truncate">
                              {influencer.Description}
                            </div>
                            {isMobile && (
                              <div className="flex gap-1 mt-1">
                                <Badge className={`${getInfluencerCategoryColor(influencer.Category || 'Other')} text-xs`}>
                                  {influencer.Category}
                                </Badge>
                                <Badge className="text-xs bg-muted">{influencer.Platform}</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="text-xs sm:text-sm">
                          <Badge className={getInfluencerCategoryColor(influencer.Category || 'Other')}>
                            {influencer.Category}
                          </Badge>
                        </TableCell>
                      )}
                      {!isMobile && (
                        <TableCell className="text-xs sm:text-sm">
                          <span className="font-medium">{influencer.Platform}</span>
                        </TableCell>
                      )}
                      <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{influencer.Followers.toLocaleString()}</span>
                          {influencer.socialStats?.source === 'live' && (
                            <span className="text-[9px] font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                              Live
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {!isMobile && (
                        <TableCell className="text-xs sm:text-sm">
                          <Badge className={getEngagementColor(influencer.Engagement || 'Medium')}>
                            {influencer.Engagement}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-xs sm:text-sm">
                        {influencer.Website && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
                            onClick={() => window.open(influencer.Website, '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Follow
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <Star className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">No Influencers Yet</h3>
              <p className="text-sm sm:text-base text-muted-foreground">Influencers will be listed here as they join the Pi Network ecosystem.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN ECOLOGY COMPONENT
// ============================================================================

function EcologyContent() {
  const [tab, setTab] = useState<string>('communities');
  const isMobile = useMediaQuery('(max-width: 1024px)');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const v = params.get('tab');
    setTab(Array.isArray(v) ? v[0] : (v || 'communities'));
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tab);
    window.history.replaceState({}, '', url.toString());
  }, [tab]);

  return (
    <div className="min-h-screen bg-background container mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4 px-2">
            Pi Network Ecology
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            Explore the vibrant Pi Network ecosystem - communities, events, hackathons, and influencers
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <div>
            <TabsList className="sticky top-0 z-[40] bg-card/95 backdrop-blur border-b border-border flex gap-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none]">
              <TabsTrigger value="communities" className="basis-1/4 shrink-0 text-xs sm:text-sm">Communities</TabsTrigger>
              <TabsTrigger value="influencers" className="basis-1/4 shrink-0 text-xs sm:text-sm">Influencers</TabsTrigger>
              <TabsTrigger value="events" className="basis-1/4 shrink-0 text-xs sm:text-sm">Events</TabsTrigger>
              <TabsTrigger value="hackathons" className="basis-1/4 shrink-0 text-xs sm:text-sm">Hackathons</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="communities">
            <CommunitiesTab />
          </TabsContent>

          <TabsContent value="events">
            <EventsTab />
          </TabsContent>

          <TabsContent value="hackathons">
            <HackathonsTab />
          </TabsContent>

          <TabsContent value="influencers">
            <InfluencersTab />
          </TabsContent>
        </Tabs>
        
        {/* Spacer to keep last rows above mobile bottom nav */}
        <div className="h-24 lg:hidden" />
      </div>
    </div>
  );
}

export default function EcologyPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Spinner /></div>}>
      <EcologyContent />
    </Suspense>
  );
}
