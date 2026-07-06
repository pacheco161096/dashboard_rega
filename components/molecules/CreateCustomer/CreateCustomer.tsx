"use client";

import { FC } from "react";
import { CustomerForm } from "../CustomerForm/CustomerForm";

export interface CreateCustomerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Wrapper ligero sobre CustomerForm en modo creación. */
export const CreateCustomer: FC<CreateCustomerProps> = ({ open, onOpenChange }) => (
  <CustomerForm open={open} onOpenChange={onOpenChange} mode="create" />
);
