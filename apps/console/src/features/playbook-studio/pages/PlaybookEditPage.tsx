import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PlaybookEditor } from '../components/PlaybookEditor';

export function PlaybookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/playbooks')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>
      
      <PlaybookEditor playbookId={id} />
    </div>
  );
}
