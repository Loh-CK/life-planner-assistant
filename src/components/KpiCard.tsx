import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarIcon, ListCheckIcon, DollarSignIcon, TimerIcon } from "lucide-react";

export type KpiCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
};

export const KpiCard = ({ title, value, icon }: KpiCardProps) => (
  <Card className="flex flex-col justify-between h-full">
    <CardHeader className="flex items-center space-x-2">
      {icon}
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-bold">{value}</p>
    </CardContent>
  </Card>
);
