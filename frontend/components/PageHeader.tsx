import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
  backPath?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ title, description, backPath, children }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex justify-between items-start md:items-center mb-6 flex-col md:flex-row gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-10 w-10 flex-shrink-0" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}
