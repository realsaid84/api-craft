import { FileSearch } from 'lucide-react';
import PageLayout from '../layouts/APIStudioLayout';

const DataModelsPage: React.FC = () => {
  const models = [
    { name: 'Customer Profile', category: 'Core', status: 'Published' },
    { name: 'Order Management', category: 'Business', status: 'Draft' },
    { name: 'Payment Processing', category: 'Financial', status: 'Published' },
  ];

  return (
    <PageLayout 
      title="Data Model Discovery" 
      description="Browse and search through available data models across your organization."
    >
      {/* Content from previous implementation */}
    </PageLayout>
  );
};

export default DataModelsPage;