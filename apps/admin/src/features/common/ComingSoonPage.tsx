interface ComingSoonPageProps {
  feature: string;
}

export function ComingSoonPage({ feature }: ComingSoonPageProps) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
      <h1 className="text-3xl font-bold mb-4">{feature}</h1>
      <p className="text-muted-foreground text-lg">
        Coming Soon
      </p>
      <p className="text-muted-foreground mt-2">
        This feature is currently under development.
      </p>
    </div>
  );
}
