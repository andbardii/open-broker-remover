
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { DataRequest } from '@/lib/types';

interface DashboardProps {
  requests: DataRequest[];
}

const Dashboard: React.FC<DashboardProps> = ({ requests }) => {
  // Calculate statistics
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const sentRequests = requests.filter(r => r.status === 'sent').length;
  const respondedRequests = requests.filter(r => r.status === 'responded').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  
  const completionPercentage = totalRequests ? Math.round((completedRequests / totalRequests) * 100) : 0;
  
  // Data for pie chart
  const pieData = [
    { name: 'Pending', value: pendingRequests, color: '#CBD5E1' },
    { name: 'Sent', value: sentRequests, color: '#60A5FA' },
    { name: 'Responded', value: respondedRequests, color: '#34D399' },
    { name: 'Completed', value: completedRequests, color: '#8B5CF6' },
  ].filter(item => item.value > 0);
  
  // Data for bar chart - simulating monthly activity
  const barData = [
    { name: 'Jan', requests: 4 },
    { name: 'Feb', requests: 7 },
    { name: 'Mar', requests: 5 },
    { name: 'Apr', requests: 8 },
    { name: 'May', requests: 12 },
    { name: 'Jun', requests: 9 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-full lg:col-span-2">
        <CardHeader>
          <CardTitle>Request Overview</CardTitle>
          <CardDescription>Monitor your data removal requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{totalRequests}</div>
              <div className="text-sm text-muted-foreground">Total Requests</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{pendingRequests}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{sentRequests + respondedRequests}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{completedRequests}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span>Overall Completion</span>
              <span>{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
          
          <div className="mt-6">
            <h3 className="font-medium mb-2">Monthly Activity</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-full lg:col-span-1">
        <CardHeader>
          <CardTitle>Request Status</CardTitle>
          <CardDescription>Current status breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
