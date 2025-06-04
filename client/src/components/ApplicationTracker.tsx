import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, Plus, Eye, Calendar, Building, TrendingUp } from "lucide-react";
import type { Application } from "@shared/schema";

export default function ApplicationTracker() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest('PATCH', `/api/applications/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Success",
        description: "Application status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'applied':
        return 'default';
      case 'interview':
        return 'secondary';
      case 'offer':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'interview':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      case 'offer':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    statusMutation.mutate({ id, status });
  };

  // Calculate stats
  const stats = applications.reduce(
    (acc, app) => {
      acc.total++;
      if (app.status === 'applied') acc.applied++;
      if (app.status === 'interview') acc.interviews++;
      if (app.status === 'offer') acc.offers++;
      if (app.status === 'rejected') acc.rejected++;
      return acc;
    },
    { total: 0, applied: 0, interviews: 0, offers: 0, rejected: 0 }
  );

  const responseRate = stats.total > 0 ? Math.round(((stats.interviews + stats.offers) / stats.total) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="premium-shadow">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Application Tracker</h2>
          <p className="text-muted-foreground">Monitor your job applications and track progress</p>
        </div>
        <Button className="gradient-primary text-white border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Application
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Applied</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.applied}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.interviews}</div>
          <div className="text-sm text-muted-foreground">Interviews</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.offers}</div>
          <div className="text-sm text-muted-foreground">Offers</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{responseRate}%</div>
          <div className="text-sm text-muted-foreground">Response Rate</div>
        </Card>
      </div>

      {/* Applications Table */}
      <Card className="premium-shadow">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span>Your Applications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your job applications to monitor your progress.</p>
              <Button className="gradient-primary text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Application
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Details</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-foreground">
                            {/* We would need to join with jobs table to get title/company */}
                            Job Application #{application.id}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Applied via JobCraft AI
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {application.appliedAt 
                              ? new Date(application.appliedAt).toLocaleDateString()
                              : 'N/A'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={application.status}
                          onValueChange={(value) => handleStatusChange(application.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="applied">Applied</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="offer">Offer</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {application.matchScore ? (
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-primary">
                              {application.matchScore}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
