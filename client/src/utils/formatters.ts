// Indian Rupee (INR) and Location utilities for Fixora

export const CURRENCY_SYMBOL = '₹';

/**
 * Format any numeric value into Indian Rupee format (e.g. ₹12,450)
 */
export const formatINR = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '₹0';
  const num = Math.round(Number(val));
  return `₹${num.toLocaleString('en-IN')}`;
};

/**
 * Format numeric value with 2 decimal places in Indian Rupee format (e.g. ₹12,450.50)
 */
export const formatINRPrecise = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || isNaN(Number(val))) return '₹0.00';
  const num = Number(val);
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export interface IndianCityDiscom {
  id: string;
  city: string;
  state: string;
  discom: string;
  defaultUnitRate: number; // ₹ per kWh
  fixedCharge: number; // ₹ per kW/month
  dutyTaxPercent: number; // % electricity tax
  avgSolarSunHours: number; // hours per day
}

export const INDIAN_CITIES_DISCOM: IndianCityDiscom[] = [
  {
    id: 'blr',
    city: 'Bengaluru',
    state: 'Karnataka',
    discom: 'BESCOM (Bangalore Electricity Supply Co.)',
    defaultUnitRate: 7.65,
    fixedCharge: 110,
    dutyTaxPercent: 9.0,
    avgSolarSunHours: 4.8,
  },
  {
    id: 'bom',
    city: 'Mumbai',
    state: 'Maharashtra',
    discom: 'MSEDCL / Adani / Tata Power',
    defaultUnitRate: 9.20,
    fixedCharge: 145,
    dutyTaxPercent: 16.0,
    avgSolarSunHours: 4.9,
  },
  {
    id: 'del',
    city: 'Delhi-NCR',
    state: 'Delhi',
    discom: 'BSES Rajdhani / TPDDL',
    defaultUnitRate: 6.50,
    fixedCharge: 85,
    dutyTaxPercent: 5.0,
    avgSolarSunHours: 5.1,
  },
  {
    id: 'hyd',
    city: 'Hyderabad',
    state: 'Telangana',
    discom: 'TSSPDCL (Southern Power Telangana)',
    defaultUnitRate: 7.20,
    fixedCharge: 95,
    dutyTaxPercent: 6.0,
    avgSolarSunHours: 5.0,
  },
  {
    id: 'pun',
    city: 'Pune',
    state: 'Maharashtra',
    discom: 'MSEDCL Pune Circle',
    defaultUnitRate: 8.50,
    fixedCharge: 130,
    dutyTaxPercent: 16.0,
    avgSolarSunHours: 4.9,
  },
  {
    id: 'maa',
    city: 'Chennai',
    state: 'Tamil Nadu',
    discom: 'TANGEDCO',
    defaultUnitRate: 6.80,
    fixedCharge: 90,
    dutyTaxPercent: 5.0,
    avgSolarSunHours: 5.2,
  },
  {
    id: 'ggn',
    city: 'Gurugram',
    state: 'Haryana',
    discom: 'DHBVN (Dakshin Haryana Bijli)',
    defaultUnitRate: 7.10,
    fixedCharge: 120,
    dutyTaxPercent: 6.5,
    avgSolarSunHours: 5.0,
  },
  {
    id: 'noi',
    city: 'Noida',
    state: 'Uttar Pradesh',
    discom: 'NPCL / PVVNL',
    defaultUnitRate: 7.00,
    fixedCharge: 110,
    dutyTaxPercent: 7.5,
    avgSolarSunHours: 5.0,
  },
  {
    id: 'ccu',
    city: 'Kolkata',
    state: 'West Bengal',
    discom: 'CESC (Calcutta Electric Supply Corp)',
    defaultUnitRate: 7.85,
    fixedCharge: 105,
    dutyTaxPercent: 5.0,
    avgSolarSunHours: 4.6,
  },
  {
    id: 'amd',
    city: 'Ahmedabad',
    state: 'Gujarat',
    discom: 'Torrent Power / UGVCL',
    defaultUnitRate: 6.40,
    fixedCharge: 100,
    dutyTaxPercent: 15.0,
    avgSolarSunHours: 5.4,
  },
  {
    id: 'jai',
    city: 'Jaipur',
    state: 'Rajasthan',
    discom: 'JVVNL (Jaipur Vidyut Vitran Nigam)',
    defaultUnitRate: 7.45,
    fixedCharge: 125,
    dutyTaxPercent: 8.0,
    avgSolarSunHours: 5.5,
  },
  {
    id: 'cok',
    city: 'Kochi',
    state: 'Kerala',
    discom: 'KSEB (Kerala State Electricity Board)',
    defaultUnitRate: 6.70,
    fixedCharge: 95,
    dutyTaxPercent: 10.0,
    avgSolarSunHours: 4.7,
  },
  {
    id: 'ixc',
    city: 'Chandigarh',
    state: 'Chandigarh',
    discom: 'Chandigarh Electricity Department',
    defaultUnitRate: 5.80,
    fixedCharge: 80,
    dutyTaxPercent: 5.0,
    avgSolarSunHours: 5.1,
  },
  {
    id: 'lko',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    discom: 'MVVNL (Madhyanchal Vidyut Vitran)',
    defaultUnitRate: 6.90,
    fixedCharge: 110,
    dutyTaxPercent: 7.5,
    avgSolarSunHours: 5.0,
  },
];
