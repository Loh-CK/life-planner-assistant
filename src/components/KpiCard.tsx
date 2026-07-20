import { Card, CardContent } from "@/components/ui/card";

export type KpiCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
};

export const KpiCard = ({ title, value, icon }: KpiCardProps) => (
  <Card className="h-full transition-shadow hover:shadow-md">
    <CardContent className="flex items-center gap-4 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-muted-foreground truncate">{title}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
      </div>
    </CardContent>
  </Card>
);
