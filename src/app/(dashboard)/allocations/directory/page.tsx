'use client';

import { useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Home, Clock, CheckCircle, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Summary card component
function SummaryCard({ title, value, icon: Icon, description }: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// Individual card component for displaying records
function RecordCard({ record, type }: { record: any; type: string }) {
  const getStatusBadge = () => {
    switch (type) {
      case 'queue':
        return <Badge variant="secondary">In Queue</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending Approval</Badge>;
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'past':
        return <Badge variant="secondary">Past</Badge>;
      default:
        return null;
    }
  };

  const getTitle = () => {
    if (type === 'queue') {
      return `${record.rank} ${record.fullName}`;
    } else if (type === 'pending') {
      return `${record.personnelData?.rank || ''} ${record.personnelData?.fullName || ''}`;
    } else if (type === 'active') {
      return `${record.currentOccupantRank || ''} ${record.currentOccupantName || ''}`;
    } else if (type === 'past') {
      return `${record.personnelData?.rank || ''} ${record.personnelData?.fullName || ''}`;
    }
    return 'Unknown';
  };

  const getServiceNumber = () => {
    if (type === 'queue') return record.svcNo;
    if (type === 'pending') return record.personnelData?.svcNo;
    if (type === 'active') return record.currentOccupantServiceNumber;
    if (type === 'past') return record.personnelData?.serviceNumber;
    return 'N/A';
  };

  const getUnit = () => {
    if (type === 'queue') return 'Any Available';
    if (type === 'pending') return record.unitData?.unitName || 'N/A';
    if (type === 'active') return record.unitName;
    if (type === 'past') return record.unitData?.unitName;
    return 'N/A';
  };

  const getDate = () => {
    if (type === 'queue') return record.createdAt;
    if (type === 'pending') return record.createdAt;
    if (type === 'active') return record.occupancyStartDate;
    if (type === 'past') return record.allocationEndDate || record.createdAt;
    return null;
  };

  const dateValue = getDate();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className='flex items-center gap-3'>
            {(() => {
              const imageUrl = record.imageUrl || 
                              record.queue?.imageUrl || 
                              record.personnelData?.imageUrl || 
                              (type === 'active' && record.occupants?.find((o: any) => o.isCurrent)?.queue?.imageUrl);
              return imageUrl ? (
                <div className='relative w-32 h-32'>
                  <Image
                    src={imageUrl}
                    alt={getTitle()}
                    fill
                    sizes="128px"
                    className='object-cover border-2 border-gray-200'
                  />
                </div>
              ) : (
                <div className='flex items-center justify-center w-32 h-32 bg-gray-100'>
                  <User className='h-16 w-16 text-gray-400' />
                </div>
              );
            })()}
            <div>
              <CardTitle className="text-lg">{getTitle()}</CardTitle>
              <CardDescription>Service No: {getServiceNumber()}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Unit:</span>
          <span className="font-medium">{getUnit()}</span>
        </div>
        
        {type === 'queue' && record.sequence && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Queue Position:</span>
            <span className="font-medium">#{record.sequence}</span>
          </div>
        )}
        
        {dateValue && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {type === 'queue' ? 'Applied On:' : 
               type === 'pending' ? 'Requested On:' :
               type === 'active' ? 'Allocated On:' : 'Vacated On:'}
            </span>
            <span className="font-medium">{format(new Date(dateValue), 'MMM d, yyyy')}</span>
          </div>
        )}
        
        {type === 'active' && record.accommodationType && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-medium">{record.accommodationType.name}</span>
          </div>
        )}
        
        {(type === 'queue' || type === 'pending') && (record.maritalStatus || record.personnelData?.maritalStatus) && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Marital Status:</span>
            <span className="font-medium">{record.maritalStatus || record.personnelData?.maritalStatus}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AllocationDirectoryPage() {
  const [activeTab, setActiveTab] = useState('all');

  // Fetch data from all endpoints
  const { data: queueData, error: queueError, isLoading: queueLoading } = useSWR('/api/queue', fetcher);
  const { data: pendingData, error: pendingError, isLoading: pendingLoading } = useSWR('/api/allocations/requests', fetcher);
  const { data: activeData, error: activeError, isLoading: activeLoading } = useSWR('/api/dhq-living-units?status=Occupied', fetcher);
  const { data: pastData, error: pastError, isLoading: pastLoading } = useSWR('/api/allocations/past', fetcher);

  // Calculate totals
  const queueTotal = queueData?.length || 0;
  const pendingTotal = pendingData?.length || 0;
  const activeTotal = activeData?.data?.length || 0;
  const pastTotal = pastData?.length || 0;
  const totalRecords = queueTotal + pendingTotal + activeTotal + pastTotal;

  // Combine all data for 'all' tab
  const getAllRecords = () => {
    const records = [];
    
    if (queueData) {
      records.push(...queueData.map((item: any) => ({ ...item, _type: 'queue' })));
    }
    if (pendingData) {
      records.push(...pendingData.map((item: any) => ({ ...item, _type: 'pending' })));
    }
    if (activeData?.data) {
      records.push(...activeData.data.map((item: any) => ({ ...item, _type: 'active' })));
    }
    if (pastData) {
      records.push(...pastData.map((item: any) => ({ ...item, _type: 'past' })));
    }
    
    return records;
  };

  const isLoading = queueLoading || pendingLoading || activeLoading || pastLoading;
  const hasError = queueError || pendingError || activeError || pastError;

  if (hasError) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading allocation data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Allocation Directory</h1>
        <p className="text-muted-foreground">Complete overview of all accommodation allocations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <SummaryCard
          title="Total Records"
          value={totalRecords}
          icon={Users}
          description="All allocation records"
        />
        <SummaryCard
          title="In Queue"
          value={queueTotal}
          icon={Clock}
          description="Awaiting allocation"
        />
        <SummaryCard
          title="Pending Approval"
          value={pendingTotal}
          icon={AlertCircle}
          description="Requires admin action"
        />
        <SummaryCard
          title="Active Allocations"
          value={activeTotal}
          icon={Home}
          description="Currently occupied"
        />
        <SummaryCard
          title="Past Allocations"
          value={pastTotal}
          icon={CheckCircle}
          description="Historical records"
        />
      </div>

      {/* Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({totalRecords})</TabsTrigger>
          <TabsTrigger value="queue">Queue ({queueTotal})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingTotal})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeTotal})</TabsTrigger>
          <TabsTrigger value="past">Past ({pastTotal})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getAllRecords().map((record, index) => (
                <RecordCard key={`${record._type}-${record.id || index}`} record={record} type={record._type} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queue" className="mt-6">
          {queueLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {queueData?.map((record: any) => (
                <RecordCard key={record.id} record={record} type="queue" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingData?.map((record: any) => (
                <RecordCard key={record.id} record={record} type="pending" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {activeLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeData?.data?.map((record: any) => (
                <RecordCard key={record.id} record={record} type="active" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastData?.map((record: any) => (
                <RecordCard key={record.id} record={record} type="past" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}