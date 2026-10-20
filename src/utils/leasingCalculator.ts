import { AmortizationYearRow, LeaseCalculation, UserProfile, VehicleInfo } from '../types';
import { SDB_MOTOR_SHOW_CONFIG } from '../data/salaryRanges';

export function formatLKR(amount: number, short = false): string {
  if (isNaN(amount) || amount === 0) return 'Rs. 0';
  if (short) {
    if (amount >= 10000000) {
      return `Rs. ${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 1000000) {
      return `Rs. ${(amount / 1000000).toFixed(2)} Mn`;
    }
    if (amount >= 100000) {
      return `Rs. ${(amount / 100000).toFixed(1)} Lakh`;
    }
  }
  return `Rs. ${Math.round(amount).toLocaleString('en-LK')}`;
}

export interface CalculateLeaseOptions {
  vehiclePrice: number;
  downPaymentPercent: number; // e.g. 25
  tenureYears: number; // e.g. 5
  interestRate?: number; // e.g. 13.25
  userProfile?: UserProfile | null;
}

export function calculateSDBLease({
  vehiclePrice,
  downPaymentPercent = 30,
  tenureYears = 5,
  interestRate = SDB_MOTOR_SHOW_CONFIG.promoInterestRate,
  userProfile = null,
}: CalculateLeaseOptions): LeaseCalculation {
  const downPaymentAmount = Math.round(vehiclePrice * (downPaymentPercent / 100));
  const leaseAmount = Math.max(0, vehiclePrice - downPaymentAmount);
  const tenureMonths = tenureYears * 12;

  // Monthly interest rate
  const monthlyRate = (interestRate / 100) / 12;

  let monthlyInstallment = 0;
  if (monthlyRate === 0) {
    monthlyInstallment = leaseAmount / tenureMonths;
  } else {
    monthlyInstallment = Math.round(
      (leaseAmount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );
  }

  const totalPayableWithoutDown = monthlyInstallment * tenureMonths;
  const totalInterestPayable = Math.max(0, totalPayableWithoutDown - leaseAmount);
  const totalPayable = totalPayableWithoutDown + downPaymentAmount;

  // Amortization schedule by year
  const amortizationPreview: AmortizationYearRow[] = [];
  let currentBalance = leaseAmount;

  for (let y = 1; y <= tenureYears; y++) {
    const yearStartBalance = currentBalance;
    let yearPrincipal = 0;
    let yearInterest = 0;

    for (let m = 1; m <= 12; m++) {
      if (currentBalance <= 0) break;
      const mInterest = currentBalance * monthlyRate;
      const mPrincipal = Math.min(currentBalance, monthlyInstallment - mInterest);
      yearInterest += mInterest;
      yearPrincipal += mPrincipal;
      currentBalance -= mPrincipal;
    }

    amortizationPreview.push({
      year: y,
      openingBalance: Math.round(yearStartBalance),
      principalPaid: Math.round(yearPrincipal),
      interestPaid: Math.round(yearInterest),
      closingBalance: Math.max(0, Math.round(currentBalance)),
    });
  }

  // Affordability Assessment
  let status: 'AFFORDABLE' | 'STRETCH' | 'EXCEEDS_BUDGET' = 'AFFORDABLE';
  let debtBurdenRatio = 0;
  let maxRecommendedInstallment = 0;
  let message = 'Estimated installment calculated with SDB Motor Show promotional rate.';
  const tips: string[] = [];

  if (userProfile && !userProfile.isGuest && userProfile.salaryRange) {
    const income = userProfile.salaryRange.typicalNetIncomeLKR || 180000;
    maxRecommendedInstallment = Math.round(income * 0.40); // Central Bank 40% DBR maximum
    debtBurdenRatio = Math.round((monthlyInstallment / income) * 100);

    const userTargetInstallment = userProfile.preferences.targetMonthlyInstallment || maxRecommendedInstallment;

    if (monthlyInstallment <= userTargetInstallment && debtBurdenRatio <= 35) {
      status = 'AFFORDABLE';
      message = `Excellent match! At ${debtBurdenRatio}% of your net salary, this installment is well within safe banking limits (SDB Bank allows up to 40%).`;
      tips.push('Eligible for SDB Express 30-Minute Motor Show approval.');
      tips.push('0% document handling charges under the Motor Show pavilion promo.');
    } else if (monthlyInstallment <= maxRecommendedInstallment || debtBurdenRatio <= 45) {
      status = 'STRETCH';
      message = `Manageable with adjustments. This takes approx. ${debtBurdenRatio}% of your monthly income.`;
      if (tenureYears < 7) {
        tips.push(`Increase lease tenure to ${Math.min(7, tenureYears + 2)} years to bring monthly rental under ${formatLKR(Math.round(monthlyInstallment * 0.78))}.`);
      }
      if (downPaymentPercent < 40) {
        tips.push(`Increase down payment to ${downPaymentPercent + 10}% to reduce borrowing principal.`);
      }
      tips.push('Add a spouse or family co-applicant to pool verified income.');
    } else {
      status = 'EXCEEDS_BUDGET';
      message = `Monthly rental of ${formatLKR(monthlyInstallment)} represents ${debtBurdenRatio}% of current income profile (exceeds recommended 40% CBSL threshold).`;
      tips.push('Consider a certified pre-owned or lower trim of this model.');
      tips.push('Opt for maximum 7-year tenure to lower monthly commitment.');
      tips.push('Speak with SDB Bank booth specialists regarding customized balloon payment settlement plans.');
    }
  } else {
    // Guest mode general feedback
    tips.push('Complete your financial profile to get an exact Central Bank DBR affordability evaluation.');
    tips.push(`Special Motor Show Rate: ${interestRate}% p.a. valid during exhibition days.`);
  }

  return {
    vehiclePrice,
    downPaymentPercent,
    downPaymentAmount,
    leaseAmount,
    tenureYears,
    tenureMonths,
    annualInterestRate: interestRate,
    monthlyInstallment,
    totalInterestPayable,
    totalPayable,
    affordability: {
      status,
      debtBurdenRatio,
      maxRecommendedInstallment,
      message,
      tips,
    },
    amortizationPreview,
  };
}

export function generatePreApprovalCertificate(
  vehicle: VehicleInfo,
  lease: LeaseCalculation,
  userProfile: UserProfile
) {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const now = new Date();
  const validUntil = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days validity

  return {
    certificateId: `SDB-MS25-${randomSuffix}`,
    applicantName: userProfile.name || 'Motor Show Guest',
    applicantPhone: userProfile.phone || 'Not provided',
    vehicleName: `${vehicle.make} ${vehicle.model} (${vehicle.variantTrim})`,
    vehicleYear: vehicle.yearRange,
    marketPrice: vehicle.estimatedMarketValueLKR.avg,
    approvedLeaseAmount: lease.leaseAmount,
    monthlyInstallment: lease.monthlyInstallment,
    downPayment: lease.downPaymentAmount,
    tenureYears: lease.tenureYears,
    interestRate: lease.annualInterestRate,
    issuedAt: now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    validUntil: validUntil.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    boothToken: `BOOTH-A04-PASS-${randomSuffix}`,
  };
}
