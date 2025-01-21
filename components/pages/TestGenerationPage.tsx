import PageLayout from '../layouts/APIStudioLayout';
import {Code, Eye, Activity } from 'lucide-react';

export const TestGenerationPage = () => {
    const testTypes = [
      { icon: Activity, name: 'Integration Tests', description: 'End-to-end API testing' },
      { icon: Code, name: 'Contract Tests', description: 'Verify API contract compliance' },
      { icon: Eye, name: 'Performance Tests', description: 'Load and stress testing' },
    ];
  
    return (
      <PageLayout 
        title="Generate Tests" 
        description="Automatically generate different types of tests for your APIs."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testTypes.map((type, index) => {
              const Icon = type.icon;
              return (
                <div key={index} className="border rounded-lg p-6 hover:shadow-md cursor-pointer">
                  <Icon className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-semibold mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  <button className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 w-full">
                    Generate
                  </button>
                </div>
              );
            })}
          </div>
  
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Recent Test Generations</h3>
            <div className="space-y-2">
              {[
                { name: 'User API Integration Tests', time: '2 hours ago' },
                { name: 'Payment API Contract Tests', time: '5 hours ago' },
                { name: 'Order API Performance Tests', time: '1 day ago' },
              ].map((test, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span>{test.name}</span>
                  <span className="text-gray-500">{test.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  };
  

  export default TestGenerationPage;