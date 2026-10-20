export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city?: string;
  salaryRange: SalaryRange;
  familySize: number;
  preferences: {
    fuelEfficiencyPriority: 'HIGH' | 'MEDIUM' | 'ANY';
    preferredFuelType: 'ANY' | 'HYBRID' | 'PETROL' | 'DIESEL' | 'EV';
    safetyRatingPriority: '5_STAR' | '4_STAR_PLUS' | 'STANDARD';
    targetMonthlyInstallment: number; // in LKR
    bodyTypePreference?: string;
  };
  isGuest: boolean;
  registeredAt?: string;
}

export interface SalaryRange {
  id: string;
  label: string;
  minLKR: number;
  maxLKR: number;
  typicalNetIncomeLKR: number;
}

export interface VehicleInspectionDetails {
  paintCondition: string;
  exteriorCleanliness: string;
  bodyworkNotes: string;
  wearAndTearScore: number; // 1 - 10 (10 = pristine showroom)
  overallConditionGrade: 'Pristine / Showroom' | 'Excellent' | 'Good' | 'Fair' | 'Requires Attention';
}

export interface VehicleInfo {
  make: string;
  model: string;
  yearRange: string;
  variantTrim: string;
  bodyType: string;
  estimatedMarketValueLKR: {
    min: number;
    max: number;
    avg: number;
    recommendedOffer: number;
  };
  conditionScore: number; // 1-10
  conditionSummary: string;
  inspection: VehicleInspectionDetails;
  fuelEfficiency: {
    cityKmPerLitre: string;
    highwayKmPerLitre: string;
    combinedKmPerLitre: string;
    fuelType: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'Plug-in Hybrid';
    costRating: 'Very Economical' | 'Moderate' | 'Heavy';
  };
  safety: {
    ratingStars: number;
    ncapSource: string;
    airbagsCount: number | string;
    keySafetyFeatures: string[];
  };
  sriLankaContext: {
    partsAvailability: 'Very High (Islandwide)' | 'Good' | 'Moderate' | 'Special Order';
    resaleValueTrend: 'Exceptional (High Demand)' | 'Stable' | 'Depreciating' | 'Niche Market';
    recommendation: string;
  };
}

export interface LeaseCalculation {
  vehiclePrice: number;
  downPaymentPercent: number; // e.g. 20, 30, 40%
  downPaymentAmount: number;
  leaseAmount: number; // Principal
  tenureYears: number;
  tenureMonths: number;
  annualInterestRate: number; // e.g. 13.5%
  monthlyInstallment: number;
  totalInterestPayable: number;
  totalPayable: number;
  affordability: {
    status: 'AFFORDABLE' | 'STRETCH' | 'EXCEEDS_BUDGET';
    debtBurdenRatio: number; // percentage of salary
    maxRecommendedInstallment: number;
    message: string;
    tips: string[];
  };
  amortizationPreview: AmortizationYearRow[];
}

export interface AmortizationYearRow {
  year: number;
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  closingBalance: number;
}

export interface VehicleScanRecord {
  id: string;
  timestamp: string;
  imageUrl: string;
  vehicle: VehicleInfo;
  lease: LeaseCalculation;
}

export interface PreApprovalCertificate {
  certificateId: string;
  applicantName: string;
  applicantPhone: string;
  vehicleName: string;
  vehicleYear: string;
  marketPrice: number;
  approvedLeaseAmount: number;
  monthlyInstallment: number;
  downPayment: number;
  tenureYears: number;
  interestRate: number;
  issuedAt: string;
  validUntil: string;
  boothToken: string;
}
