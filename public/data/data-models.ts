// data/data-models.ts
import { DataModel } from '@/components/types/data-models';

export const DataModels: DataModel[] = [
    {
      id: '1',
      name: 'Payment Instruction',
      description: 'Core payment instruction model capturing payment details, routing, and processing requirements',
      version: '2.0.0',
      domain: 'Payment',
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
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-15',
      owner: 'Treasury Team',
      tags: ['account', 'treasury'],
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
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-18',
      owner: 'Finance Team',
      tags: ['accounting', 'reconciliation', 'treasury'],
      schema: {
        type: 'object',
        properties: {
          entryId: { type: 'string' },
          amount: { type: 'number' },
          postingDate: { type: 'string', format: 'date' }
        }
      }
    },
    {
      id: '4',
      name: 'Balance Position',
      description: 'Real-time balance tracking model for accounts and positions',
      version: '1.0.0',
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-10',
      owner: 'Treasury Team',
      tags: ['balance', 'real-time', 'position'],
      schema: {
        type: 'object',
        properties: {
          accountId: { type: 'string' },
          balance: { type: 'number' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    },
    {
      id: '5',
      name: 'Receivable Invoice',
      description: 'Invoice and receivables management model for tracking payables',
      version: '1.1.0',
      domain: 'Receivables',
      status: 'Published',
      lastModified: '2024-01-12',
      owner: 'Receivables Domain',
      tags: ['invoice', 'receivables', 'payment'],
      schema: {
        type: 'object',
        properties: {
          invoiceId: { type: 'string' },
          dueDate: { type: 'string', format: 'date' },
          status: { type: 'string' }
        }
      }
    },
    {
      id: '6',
      name: 'Liquidity Forecast',
      description: 'Cash flow and liquidity forecasting model for treasury management',
      version: '0.9.0',
      domain: 'Account',
      status: 'Draft',
      lastModified: '2024-01-19',
      owner: 'Global Liquidity and Accounts',
      tags: ['liquidity', 'forecast', 'cash-flow'],
      schema: {
        type: 'object',
        properties: {
          forecastId: { type: 'string' },
          periodStart: { type: 'string', format: 'date' },
          forecastAmount: { type: 'number' }
        }
      }
    },
    {
      id: '7',
      name: 'Payment Schedule',
      description: 'Recurring and scheduled payments management model',
      version: '1.3.0',
      domain: 'Payment',
      status: 'Published',
      lastModified: '2024-01-17',
      owner: 'Treasury Services',
      tags: ['payment', 'schedule', 'recurring'],
      schema: {
        type: 'object',
        properties: {
          scheduleId: { type: 'string' },
          frequency: { type: 'string' },
          nextDate: { type: 'string', format: 'date' }
        }
      }
    },
    {
      id: '8',
      name: 'Statement',
      description: 'Bank statement reconciliation and processing model',
      version: '1.4.0',
      domain: 'Account',
      status: 'Published',
      lastModified: '2024-01-16',
      owner: 'Global Liquidity and Accounts',
      tags: ['statement', 'reconciliation', 'treasury'],
      schema: {
        type: 'object',
        properties: {
          statementId: { type: 'string' },
          accountId: { type: 'string' },
          period: { type: 'string' }
        }
      }
    },
    {
      id: '9',
      name: 'Payment Gateway Config',
      description: 'Payment gateway integration and configuration model',
      version: '0.8.0',
      domain: 'Connectivity',
      status: 'Draft',
      lastModified: '2024-01-14',
      owner: 'Integration Team',
      tags: ['gateway', 'integration', 'config'],
      schema: {
        type: 'object',
        properties: {
          gatewayId: { type: 'string' },
          settings: { type: 'object' },
          status: { type: 'string' }
        }
      }
    },
    {
      id: '10',
      name: 'Treasury Limits',
      description: 'Treasury operation limits and threshold configuration model',
      version: '1.0.0',
      domain: 'Risk',
      status: 'Published',
      lastModified: '2024-01-13',
      owner: 'Risk Team',
      tags: ['limits', 'risk', 'compliance'],
      schema: {
        type: 'object',
        properties: {
          limitId: { type: 'string' },
          thresholds: { type: 'object' },
          currency: { type: 'string' }
        }
      }
    }
  ] as const;