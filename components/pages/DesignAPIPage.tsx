import PageLayout from '../layouts/APIStudioLayout';
// Design API Page
export const DesignAPIPage = () => {
    const templates = [
      { name: 'REST API', description: 'Standard REST API template with CRUD operations' },
      { name: 'GraphQL API', description: 'GraphQL API template with schema definition' },
      { name: 'Event-Driven API', description: 'Event-based API template with pub/sub pattern' },
    ];
  
    return (
      <PageLayout 
        title="Design an API" 
        description="Create and design APIs using predefined templates and best practices."
      >
        <div className="space-y-8">
          <div className="flex space-x-4 mb-6">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              New API
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Import Specification
            </button>
          </div>
  
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Start with a Template</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template, index) => (
                <div key={index} className="border rounded-lg p-4 hover:shadow-md cursor-pointer">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  };

  export default DesignAPIPage;