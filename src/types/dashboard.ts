export interface SubscriptionData {
  subscription_id: string;
  customer_id: string;
  customer_email: string;
  product_id: string;
  status: 'active' | 'trialing' | 'canceled';
  amount: number;
  created_at: string;
}

export interface MetricsData {
  active: number;
  trialing: number;
  cancelled: number;
  total_mrr: number;
  conversion_rate: number;
  total_records: number;
  avg_ltv: number;
  predictive_ltv: number;
  take_rate_data: {
    take_rate: number;
    new_bda_students: number;
    avery_signups: number;
    calculation_note: string;
    monthly_history: Array<{
      month: string;
      rate: number;
      signups: number;
      newMembers: number;
    }>;
  };
}

export interface ProductMetrics {
  [productName: string]: {
    active: number;
    trialing: number;
    cancelled: number;
    mrr: number;
    conversion_rate: number;
    total: number;
    avg_ltv: number;
    predictive_ltv: number;
  };
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface TrialConversionData {
  productId: string;
  conversions: number;
  total_trials: number;
  conversion_rate: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  date?: string;
}

export const BUDGETDOG_PRODUCTS = {
  'prod_S9H5fDgFs9Lv7y': 'Millionaire Club',
  'prod_S8Y6cYg18JDFLG': 'Budgetdog Network',
  'prod_RslgGi1t7MBOE6': 'Budgetdog Academy'
} as const;

export const EXCLUDED_EMAILS = [
  'brian@averyapp.ai',
  'bean.smith77@gmail.com',
  'briansmith.work578@gmail.com',
  'charlie@averyapp.ai',
  'coombescharlie54@gmail.com',
  'charlie.coombes7@gmail.com'
];