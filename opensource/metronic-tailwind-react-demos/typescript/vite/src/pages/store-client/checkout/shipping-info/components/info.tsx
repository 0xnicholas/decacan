'use client';

import { Fragment, useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiCheckboxCircleFill } from '@remixicon/react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AddressDialog } from './address-dialog';
import { AddressFormValues, addressSchema } from './forms';

interface IInfoItem {
  default: boolean;
  title: string;
  addressName: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  country: string;
  postalCode: string;
  badge?: boolean;
}

export function Info() {
  const [items, setItems] = useState<IInfoItem[]>([
    {
      default: true,
      title: 'Jeroen’s Home',
      addressName: 'Home',
      name: 'Jeroen',
      lastName: 'van Dijk',
      email: 'jeroen@vandijk.com',
      phone: '+31612345678',
      address: 'Keizersgracht 172',
      apartment: '',
      city: 'Amsterdam',
      country: 'Netherlands',
      postalCode: '1016 DW',
      badge: true,
    },
    {
      default: false,
      title: 'Sophie’s Office',
      addressName: 'Office',
      name: 'Sophie',
      lastName: 'de Vries',
      email: 'sophie@devries.com',
      phone: '+31687654321',
      address: 'Laan van Meerdervoort 88',
      apartment: '',
      city: 'The Hague',
      country: 'Netherlands',
      postalCode: '2517 AN',
      badge: false,
    },
    {
      default: false,
      title: 'Jeroen’s Home',
      addressName: 'Vacation',
      name: 'Jeroen',
      lastName: 'van Dijk',
      email: 'jeroen@vandijk.com',
      phone: '+31612345678',
      address: 'Keizersgracht 172',
      apartment: '',
      city: 'Amsterdam',
      country: 'Netherlands',
      postalCode: '1016 DW',
      badge: false,
    },
    {
      default: false,
      title: 'Emma’s Apartment',
      addressName: 'Apartment',
      name: 'Emma',
      lastName: 'van den Berg',
      email: 'emma@vandenberg.com',
      phone: '+31623456789',
      address: 'Vondelstreet 45',
      apartment: 'Apt 2',
      city: 'Amsterdam',
      country: 'Netherlands',
      postalCode: '1054 GJ',
      badge: false,
    },
  ]);

  // Dialog state
  const [editOpen, setEditOpen] = useState<number | null>(null);
  const [removeOpen, setRemoveOpen] = useState<number | null>(null);

  // react-hook-form for editing
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      addressName: '',
      name: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      apartment: '',
      city: '',
      country: '',
      postalCode: '',
    },
    mode: 'onChange',
  });

  // Reset form values when editOpen changes
  useEffect(() => {
    if (editOpen !== null) {
      const item = items[editOpen];
      form.reset({
        addressName: item?.addressName || '',
        name: item?.name || '',
        lastName: item?.lastName || '',
        email: item?.email || '',
        phone: item?.phone || '',
        address: item?.address || '',
        apartment: item?.apartment || '',
        city: item?.city || '',
        country: item?.country || '',
        postalCode: item?.postalCode || '',
      });
    }
  }, [editOpen, items, form]);

  // Handle edit submit
  function handleEditSubmit(data: AddressFormValues) {
    if (editOpen === null) return;
    setItems((prev: IInfoItem[]) =>
      prev.map((item: IInfoItem, i: number) =>
        i === editOpen
          ? {
              ...item,
              ...data,
              title: data.addressName,
            }
          : item,
      ),
    );
    setEditOpen(null);
  }

  // Remove address
  function handleRemove(idx: number) {
    setItems((prev: IInfoItem[]) => prev.filter((_, i: number) => i !== idx));
    setRemoveOpen(null);
  }

  const renderItem = (item: IInfoItem, index: number) => (
    <Card key={index}>
      <CardHeader className="px-5">
        <CardTitle>{item.title}</CardTitle>
        {item.default && (
          <Badge variant="success" appearance="light">
            Ship here
          </Badge>
        )}
      </CardHeader>

      <CardContent className="px-5 space-y-4">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-mono mb-1.5">
            {item.name} {item.lastName}
          </span>

          <div className="flex flex-col gap-2 text-sm font-normal text-mono">
            <span>
              {item.postalCode}
              {item.address}
            </span>
            <span>{item.city}</span>
            <span>{item.country}</span>
            <span>Phone Number: {item.phone}</span>
          </div>
        </div>

        <div className="flex justify-between items-center min-h-8.5">
          <div className="flex items-center gap-5">
            {/* Edit Dialog */}
            <AddressDialog
              open={editOpen === index}
              onOpenChange={(val) => setEditOpen(val ? index : null)}
              initialValues={item}
              onSubmit={handleEditSubmit}
              title="Edit Address"
              description="Update the address details below."
              submitLabel="Update Address"
              trigger={
                <Button mode="link" underlined="dashed">
                  Edit
                </Button>
              }
            />

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
                  <DialogTitle>Remove Shipping Address</DialogTitle>
                </DialogHeader>
                <DialogBody className="text-sm">
                  Are you sure you want to remove this shipping address? This
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

          {item.default === false && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSelect(index)}
            >
              Select Address
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Handle Select Address
  const handleSelect = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) => ({
        ...item,
        default: i === idx,
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
