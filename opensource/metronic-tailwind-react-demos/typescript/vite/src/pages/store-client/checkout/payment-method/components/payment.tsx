'use client';

import { Fragment, ReactElement, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PaymentMethodFormValues, paymentMethodSchema } from './forms';

interface IPaymentItem {
  brandLogo: string;
  title: string;
  subTitle: string;
  description: ReactElement;
  badge?: boolean;
  cardNumber?: string;
  expiry?: string;
  cvc?: string;
  billingAddress?: string;
  name?: string;
  email?: string;
}
type IPaymentItems = Array<IPaymentItem>;

export function Payment() {
  // Simulate state for payment items (in real app, this would be lifted up or fetched)
  const [items, setItems] = useState<IPaymentItems>([
    {
      brandLogo: 'visa.svg',
      title: 'Jeroen’s Visa',
      subTitle: 'Jeroen van Dijk',
      description: (
        <span className="text-xs font-normal text-mono">
          Ending 3604 Expires on 12/2026
        </span>
      ),
      badge: true,
      cardNumber: '4111 1111 1111 3604',
      expiry: '12/2026',
      name: 'Jeroen van Dijk',
      cvc: '123',
      billingAddress: 'Keizersgracht 123, Amsterdam',
    },
    {
      brandLogo: 'ideal.svg',
      title: 'Sophie’s iDeal',
      subTitle: 'Sophie de Vries',
      description: (
        <span className="text-xs font-normal text-mono">
          iDeal with ABN Ambro
        </span>
      ),
      name: 'Sophie de Vries',
      billingAddress: 'Herengracht 456, Amsterdam',
    },
    {
      brandLogo: 'paypal.svg',
      title: 'Emma’s Paypal',
      subTitle: 'Emma van den Berg',
      description: (
        <Link
          to="#"
          className="hover:text-primary text-sm font-medium text-secondary-foreground"
        >
          emma@reui.io
        </Link>
      ),
      email: 'emma@reui.io',
      name: 'Emma van den Berg',
    },
    {
      brandLogo: 'american-express.svg',
      title: 'Bob’s American Express',
      subTitle: 'Bob van den Berg',
      description: (
        <Link
          to="#"
          className="hover:text-primary text-sm font-medium text-secondary-foreground"
        >
          bob@reui.io
        </Link>
      ),
      email: 'bob@reui.io',
      name: 'Bob van den Berg',
    },
  ]);

  // Dialog state
  const [editOpen, setEditOpen] = useState<number | null>(null); // index of item being edited, or null
  const [removeOpen, setRemoveOpen] = useState<number | null>(null); // index of item being removed, or null

  // react-hook-form for editing
  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      name: '',
      cardNumber: '',
      expiry: '',
      cvc: '',
      email: '',
      billingAddress: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (editOpen !== null) {
      const item = items[editOpen];
      form.reset({
        name: item?.name || '',
        cardNumber: item?.cardNumber || '',
        expiry: item?.expiry || '',
        cvc: item?.cvc || '',
        email: item?.email || '',
        billingAddress: item?.billingAddress || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editOpen]);

  // When opening the edit dialog, just set the index
  const handleEditOpen = (item: IPaymentItem, idx: number) => {
    setEditOpen(idx);
  };

  // Handle Edit submit
  const handleEditSubmit = async (data: PaymentMethodFormValues) => {
    if (editOpen === null) return;
    setItems((prev) =>
      prev.map((item, i) => (i === editOpen ? { ...item, ...data } : item)),
    );
    setEditOpen(null);
  };

  // Handle Remove
  const handleRemove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setRemoveOpen(null);
  };

  const renderItem = (item: IPaymentItem, index: number) => (
    <Card key={index}>
      <CardHeader className="px-5">
        <CardTitle>{item.title}</CardTitle>
        {item.badge && (
          <Badge variant="success" appearance="light">
            Pay with this
          </Badge>
        )}
      </CardHeader>

      <CardContent className="px-5 space-y-5">
        <div className="flex items-center gap-3">
          <img
            src={toAbsoluteUrl(`/media/brand-logos/${item.brandLogo}`)}
            className="size-12"
            alt="image"
          />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-mono">
              {item.subTitle}
            </span>
            {item.description}
          </div>
        </div>

        <div className="flex justify-between items-center min-h-8.5">
          <div className="flex items-center gap-5">
            {/* Edit Dialog */}
            <Dialog
              open={editOpen === index}
              onOpenChange={(open) =>
                open ? handleEditOpen(item, index) : setEditOpen(null)
              }
            >
              <DialogTrigger asChild>
                <Button mode="link" underlined="dashed">
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Payment Method</DialogTitle>
                  <DialogDescription>
                    Update your payment details below. All fields are required.
                  </DialogDescription>
                </DialogHeader>
                <DialogBody>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleEditSubmit)}
                      className="block w-full space-y-5"
                    >
                      {item.cardNumber !== undefined && (
                        <FormField
                          control={form.control}
                          name="cardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Card Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="cardNumber"
                                  maxLength={19}
                                  pattern="[0-9 ]{13,19}"
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {item.expiry !== undefined && (
                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name="expiry"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Expiry</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="expiry"
                                    placeholder="MM/YYYY"
                                    required
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cvc"
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>CVC</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    id="cvc"
                                    maxLength={4}
                                    required
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      {item.email !== undefined && (
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  id="email"
                                  type="email"
                                  required
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <FormField
                        control={form.control}
                        name="billingAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Billing Address</FormLabel>
                            <FormControl>
                              <Input {...field} id="billingAddress" required />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" variant="primary">
                          Save Changes
                        </Button>
                        <DialogClose asChild>
                          <Button type="button" variant="outline">
                            Cancel
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogBody>
              </DialogContent>
            </Dialog>

            {/* Remove Dialog */}
            <Dialog
              open={removeOpen === index}
              onOpenChange={(open) =>
                open ? setRemoveOpen(index) : setRemoveOpen(null)
              }
            >
              <DialogTrigger asChild>
                <Button mode="link" underlined="dashed">
                  Remove
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Payment Method</DialogTitle>
                </DialogHeader>
                <DialogBody className="text-sm">
                  Are you sure you want to remove this payment method? This
                  action cannot be undone.
                </DialogBody>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={() => handleRemove(index)}
                  >
                    Yes, Remove
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {item.badge !== true && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSelect(index)}
            >
              Select Card
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Handle Select Card
  const handleSelect = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) => ({
        ...item,
        badge: i === idx,
      })),
    );
    toast.custom(
      (t) => (
        <Alert variant="mono" icon="success" onClose={() => toast.dismiss(t)}>
          <AlertIcon>
            <RiCheckboxCircleFill />
          </AlertIcon>
          <AlertTitle>Address selected!</AlertTitle>
        </Alert>
      ),
      {
        duration: 5000,
      },
    );
  };

  return (
    <Fragment>
      {items.map((item, index) => {
        return renderItem(item, index);
      })}
    </Fragment>
  );
}
