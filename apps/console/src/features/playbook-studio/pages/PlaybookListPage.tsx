import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';
import { Toolbar, ToolbarActions, ToolbarHeading } from '@/layouts/demo4/components/toolbar';
import { usePlaybookStore } from '../stores/playbookStore';
import { Playbook } from '../types/playbook.types';

export function PlaybookListPage() {
  const navigate = useNavigate();
  const { playbooks, isLoading, fetchPlaybooks, deletePlaybook, publishPlaybook } = usePlaybookStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPlaybooks();
  }, [fetchPlaybooks]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    usePlaybookStore.getState().setFilters({ search: value });
  };

  const getStatusBadge = (status: Playbook['status']) => {
    const variants = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: { original: Playbook } }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.description}</div>
        </div>
      )
    },
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }: { row: { original: Playbook } }) => (
        <span className="font-mono text-sm">v{row.original.version}</span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: { original: Playbook } }) => getStatusBadge(row.original.status)
    },
    {
      accessorKey: 'author',
      header: 'Author',
      cell: ({ row }: { row: { original: Playbook } }) => row.original.author.name
    },
    {
      accessorKey: 'updatedAt',
      header: 'Last Updated',
      cell: ({ row }: { row: { original: Playbook } }) => (
        new Date(row.original.updatedAt).toLocaleDateString()
      )
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }: { row: { original: Playbook } }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/agents/playbooks/${row.original.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.original.status === 'draft' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => publishPlaybook(row.original.id)}
              >
                <Play className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deletePlaybook(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Toolbar>
        <ToolbarHeading title="Playbook Studio" description="Manage and configure playbooks" />
        <ToolbarActions>
          <Button onClick={() => navigate('/agents/playbooks/new')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Playbook
          </Button>
        </ToolbarActions>
      </Toolbar>

      <Card className="mt-6">
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search playbooks..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={playbooks}
          isLoading={isLoading}
          emptyMessage="No playbooks found. Create your first playbook to get started."
        />
      </Card>
    </>
  );
}
