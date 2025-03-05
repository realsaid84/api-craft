// data/data-models.ts
import { APIContractModel } from '@/components/types/api-contracts';

export const apiContractModels: APIContractModel[] = [
  {
    id: '1',
    name: 'Global Payments',
    description: 'Global Payments API enabling initiation of payments across diverse methods and geograhies.',
    version: '1.1.13',
    domain: 'Payment',
    status: 'Active',
    lastModified: '2024-01-20',
    owner: 'Treasury Services',
    tags: ['payment', 'core'],
    schema: '/specs/global-payments-api-v1.yaml'
  },
  {
    id: '2',
    name: 'Global Payments v2',
    description: 'Global Payments API enabling initiation of payments across diverse methods and geograhies.',
    version: '2.0.13',
    domain: 'Payment',
    status: 'Beta',
    lastModified: '2024-01-20',
    owner: 'Treasury Services',
    tags: ['payment', 'core'],
    schema: '/specs/global-payments-api-v2.yaml'
  },

  {
    id: '3',
    name: 'Account Balances API',
    description: 'Enables seamless access to account information and balances',
    version: '2.0.1',
    domain: 'Account',
    status: 'Active',
    lastModified: '2025-01-20',
    owner: 'Treasury Services',
    tags: ['payment', 'account', 'balances', 'liquidity'],
    schema: '/specs/account-balances-api-v2.yaml'
  },
  {
    id: '4',
    name: 'Transaction Details API',
    description: 'Enables seamless access to transaction details and history',
    version: '3.0.0',
    domain: 'Payment',
    status: 'GA',
    lastModified: '2024-01-20',
    owner: 'Treasury Services',
    tags: ['payment', 'reports', 'accounts', 'transactions'],
    schema: '/specs/open-api-demo.yaml'
  },
  {
    id: '5',
    name: 'Pay By Bank API',
    description: 'Facilitates Open Banking payments and account information services.',
    version: '2.0.0',
    domain: 'Receivables',
    status: 'GA',
    lastModified: '2024-12-02',
    owner: 'Treasury Services',
    tags: ['payment', 'reports', 'accounts', 'transactions'],
    schema: '/specs/pay-by-bank-api-v2.yaml'
  },
  {
    id: '6',
    name: 'Australia Realtime Payments API',
    description: 'Enables initiation of real-time payments in Australia',
    version: '1.0.0',
    domain: 'Payment',
    status: 'Deprecated',
    lastModified: '2020-12-02',
    owner: 'Treasury Services',
    tags: ['payment', 'core'],
    schema: '/specs/open-api-demo.yaml'
  },
  {
    id: '7',
    name: 'Elrond API',
    description: 'Faciltates payment initiation via an Elrond trust token',
    version: '1.0.0',
    domain: 'Risk',
    status: 'Retired',
    lastModified: '2020-12-02',
    owner: 'Treasury Services',
    tags: ['risk', 'core'],
    schema: '/specs/open-api-demo.yaml'
  }
] as const;