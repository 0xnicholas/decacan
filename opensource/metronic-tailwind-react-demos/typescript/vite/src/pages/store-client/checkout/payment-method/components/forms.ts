import { z } from 'zod';

export const paymentMethodSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  cardNumber: z
    .string()
    .min(13, { message: 'Card number is too short' })
    .max(19, { message: 'Card number is too long' })
    .regex(/^\d{13,19}$/, { message: 'Card number must be numeric' }),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/(\d{4})$/, { message: 'Expiry must be MM/YYYY' }),
  cvc: z
    .string()
    .min(3, { message: 'CVC is too short' })
    .max(4, { message: 'CVC is too long' })
    .regex(/^\d{3,4}$/, { message: 'CVC must be numeric' }),
  email: z.string().email({ message: 'Invalid email address' }),
  billingAddress: z.string().min(5, { message: 'Billing address is required' }),
});

export type PaymentMethodFormValues = z.infer<typeof paymentMethodSchema>;
