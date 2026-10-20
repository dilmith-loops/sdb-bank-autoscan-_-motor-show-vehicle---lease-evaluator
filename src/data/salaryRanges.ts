import { SalaryRange } from '../types';

export const SALARY_RANGES: SalaryRange[] = [
  {
    id: 'range-1',
    label: 'Rs. 75,000 – Rs. 150,000 / month',
    minLKR: 75000,
    maxLKR: 150000,
    typicalNetIncomeLKR: 110000,
  },
  {
    id: 'range-2',
    label: 'Rs. 150,000 – Rs. 250,000 / month',
    minLKR: 150000,
    maxLKR: 250000,
    typicalNetIncomeLKR: 200000,
  },
  {
    id: 'range-3',
    label: 'Rs. 250,000 – Rs. 400,000 / month',
    minLKR: 250000,
    maxLKR: 400000,
    typicalNetIncomeLKR: 320000,
  },
  {
    id: 'range-4',
    label: 'Rs. 400,000 – Rs. 650,000 / month',
    minLKR: 400000,
    maxLKR: 650000,
    typicalNetIncomeLKR: 520000,
  },
  {
    id: 'range-5',
    label: 'Rs. 650,000 – Rs. 1,000,000 / month',
    minLKR: 650000,
    maxLKR: 1000000,
    typicalNetIncomeLKR: 800000,
  },
  {
    id: 'range-6',
    label: 'Above Rs. 1,000,000 / month (Executive/Corporate)',
    minLKR: 1000000,
    maxLKR: 2500000,
    typicalNetIncomeLKR: 1500000,
  },
];

export const SDB_MOTOR_SHOW_CONFIG = {
  eventName: 'Colombo International Motor Show 2025 / 2026',
  venue: 'BMICH, Colombo 07',
  pavilionBooth: 'Booth A-04 (SDB Bank Financial Hub)',
  promoInterestRate: 13.25, // Promotional Motor Show special p.a.
  standardInterestRate: 15.5,
  hotline: '+94 11 541 1411',
  whatsappSupport: '+94 77 123 4567',
  officerInCharge: 'Suresh Fernando (Senior Leasing Executive)',
};
