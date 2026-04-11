import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ConsoleLibraryEntry } from '../api/agentsConsoleApi';

interface AgentAssetLibraryPageProps {
  title: string;
  description: string;
  items: ConsoleLibraryEntry[];
}

export function AgentAssetLibraryPage({ title, description, items }: AgentAssetLibraryPageProps) {
  return (
    <div className="space-y-6 px-5 pb-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-mono">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{description}</p>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
              <CardDescription>{item.id}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
