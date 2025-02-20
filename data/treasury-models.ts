// data/treasury-models.ts
import { DataModel } from '@/components/types/data-models';

export const treasuryDataModels: DataModel[] = [
  {
    id: '1',
    name: 'Payment Order',
    description: 'Core payment instruction model capturing payment details, routing, and processing requirements',
    version: '2.0.0',
    category: 'Core',
    status: 'Published',
    lastModified: '2024-01-20',
    owner: 'Treasury Team',
    tags: ['payment', 'core', 'transaction'],
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        amount: { type: 'number' },
        currency: { type: 'string' }
      }
    }
  },
  {
    id: '2',
    name: 'Bank Account',
    description: 'Account information model including balance, account type, and ownership details',
    version: '1.5.0',
    category: 'Core',
    status: 'Published',
    lastModified: '2024-01-15',
    owner: 'Treasury Team',
    tags: ['account', 'banking', 'core'],
    schema: {
      type: 'object',
      properties: {
        accountNumber: { type: 'string' },
        type: { type: 'string' },
        currency: { type: 'string' }
      }
    }
  },
  {
    id: '3',
    name: 'Posting Entry',
    description: 'Accounting entry model for financial transactions and reconciliation',
    version: '1.2.0',
    category: 'Business',
    status: 'Published',
    lastModified: '2024-01-18',
    owner: 'Finance Team',
    tags: ['accounting', 'reconciliation', 'finance'],
    schema: {
      type: 'object',
      properties: {
        entryId: { type: 'string' },
        amount: { type: 'number' },
        postingDate: { type: 'string', format: 'date' }
      }
    }
  },
  // ... rest of the models
] as const;