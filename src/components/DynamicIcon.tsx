import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  // Normalize icon name
  const cleanName = name?.trim();
  // Find in Lucide icons
  const IconComponent = (Icons as unknown as Record<string, React.FC<LucideProps>>)[cleanName] || Icons.Grid;

  return <IconComponent {...props} />;
};
