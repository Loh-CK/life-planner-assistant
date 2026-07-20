import { CompassIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-screen bg-background text-foreground text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <CompassIcon className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">Page not found</h1>
        <p className="text-muted-foreground mt-1">
          The page you're looking for doesn't exist or has moved.
        </p>
      </div>
      <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
    </div>
  );
};

export default NotFound;
