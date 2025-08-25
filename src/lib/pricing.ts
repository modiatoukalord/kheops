
import type { Contract } from "@/components/admin/contract-management";

export const servicesWithPrices = {
  "Prise de voix": 30000,
  "Prise de voix + Mix": 50000,
  "Full-package": 75000,
};

export const KHEOPS_MEMBER_FEE = 5000;

export const calculatePrice = (service: string, timeSlotsCount: number, customPrices?: Contract['customPrices']) => {
    if (customPrices && customPrices[service] !== undefined) {
        return customPrices[service] * timeSlotsCount;
    }
    const rate = servicesWithPrices[service as keyof typeof servicesWithPrices] || 0;
    return rate * timeSlotsCount;
};
