'use client'

import { useState } from 'react'
import { useQueueData, useDeleteQueueEntry } from '@/hooks/useQueueDataNext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Trash2, Edit } from 'lucide-react'
import { QueueForm } from '@/components/QueueForm'
import { Dialog, DialogContent } from '@/components/ui/dialog'

export default function QueuePage() {
  const [filters, setFilters] = useState({
    search: '',
    gender: '',
    category: '',
    maritalStatus: ''
  })
  const [showAddForm, setShowAddForm] = useState(false)

  // Use auto-refresh instead of Socket.io
  const { data: queue, isLoading } = useQueueData(filters, { 
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  })
  const deleteEntry = useDeleteQueueEntry()

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry.mutateAsync(id)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Queue Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add to Queue
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter queue entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, service number..."
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={filters.gender} onValueChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Men">Men</SelectItem>
                <SelectItem value="Officer">Officer</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.maritalStatus} onValueChange={(value) => setFilters(prev => ({ ...prev, maritalStatus: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Marital Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Queue List</CardTitle>
          <CardDescription>{queue?.data?.length || 0} people in queue</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Service No</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>Arm of Service</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Marital Status</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queue?.data?.map((entry: any) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.sequence}</TableCell>
                  <TableCell>{entry.fullName}</TableCell>
                  <TableCell>{entry.svcNo}</TableCell>
                  <TableCell>{entry.rank}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{entry.armOfService}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.category === 'Officer' ? 'default' : 'secondary'}>
                      {entry.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{entry.maritalStatus}</TableCell>
                  <TableCell>{entry.currentUnit || '-'}</TableCell>
                  <TableCell>{new Date(entry.entryDateTime).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        disabled={deleteEntry.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <QueueForm 
            item={null}
            onSubmit={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}