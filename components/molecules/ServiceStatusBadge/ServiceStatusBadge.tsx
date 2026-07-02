"use client";

import { FC } from "react";
import { Badge } from "@/components/ui/badge";
import {
  CustomerServiceStatusInput,
  getServiceStatusBadgeClass,
  getServiceStatusBadgeVariant,
  getServiceStatusLabel,
  resolveServiceStatus,
} from "@/lib/utils/customerServiceStatus";

interface ServiceStatusBadgeProps {
  customer: CustomerServiceStatusInput;
  className?: string;
}

export const ServiceStatusBadge: FC<ServiceStatusBadgeProps> = ({ customer, className }) => {
  const status = resolveServiceStatus(customer);

  return (
    <Badge
      variant={getServiceStatusBadgeVariant(status)}
      className={[getServiceStatusBadgeClass(status), className].filter(Boolean).join(" ")}
    >
      {getServiceStatusLabel(status)}
    </Badge>
  );
};
