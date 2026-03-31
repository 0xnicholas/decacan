import { z } from 'zod';

export const addressSchema = z.object({
  addressName: z.string().min(2, { message: 'Address Name is required' }),
  name: z.string().min(2, { message: 'First Name is required' }),
  lastName: z.string().min(2, { message: 'Last Name is required' }),
  email: z.string().email({ message: 'Valid email is required' }),
  phone: z.string().min(6, { message: 'Phone number is required' }),
  address: z.string().min(2, { message: 'Address is required' }),
  apartment: z.string().optional(),
  city: z.string().min(2, { message: 'City is required' }),
  country: z.string().min(2, { message: 'Country is required' }),
  postalCode: z.string().min(2, { message: 'Zip/Postal Code is required' }),
});

export type AddressFormValues = z.infer<typeof addressSchema>;
