
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface QuickActionsProps {
  actions: QuickAction[];
  title?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  actions, 
  title = "Actions Rapides" 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            onClick={action.onClick}
            className="flex items-center space-x-2"
          >
            <action.icon className="h-4 w-4" />
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
