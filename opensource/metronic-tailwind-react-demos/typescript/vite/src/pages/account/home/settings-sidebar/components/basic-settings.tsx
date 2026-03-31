import { useState } from 'react';
import { AvatarInput } from '@/partials/common/avatar-input';
import { format } from 'date-fns';
import { CalendarDays, CalendarIcon, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateInput, TimeField } from '@/components/ui/datefield';
import { Input, InputAddon, InputGroup } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const BasicSettings = () => {
  const [date, setDate] = useState<Date | undefined>(new Date(1984, 0, 20));
  const [nameInput, setNameInput] = useState('Jason Tatum');
  const [companyInput, setCompanyInput] = useState('KeenThemes');
  const [phoneInput, setPhoneInput] = useState('');

  // Docs: https://www.reui.io/docs/date-picker#date--time
  const today = new Date();
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(
    today,
  );
  const [availabilityTime, setAvailabilityTime] = useState<string | undefined>(
    '10:00',
  );
  const availabilityTimeSlots = [
    { time: '09:00', available: false },
    { time: '09:30', available: false },
    { time: '10:00', available: true },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: true },
    { time: '12:00', available: false },
    { time: '12:30', available: true },
    { time: '13:00', available: true },
    { time: '13:30', available: true },
    { time: '14:00', available: true },
    { time: '14:30', available: false },
    { time: '15:00', available: false },
    { time: '15:30', available: true },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: true },
    { time: '18:00', available: true },
    { time: '18:30', available: true },
    { time: '19:00', available: true },
    { time: '19:30', available: true },
    { time: '20:00', available: true },
    { time: '20:30', available: true },
    { time: '21:00', available: true },
    { time: '21:30', available: true },
    { time: '22:00', available: true },
    { time: '22:30', available: true },
    { time: '23:00', available: true },
    { time: '23:30', available: true },
    { time: '24:00', available: true },
  ];

  return (
    <Card className="pb-2.5">
      <CardHeader id="basic_settings">
        <CardTitle>Basic Settings</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Photo</Label>
          <div className="flex items-center justify-between flex-wrap grow gap-2.5">
            <span className="text-sm text-secondary-foreground">
              150x150px JPEG, PNG Image
            </span>
            <AvatarInput />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Name
            </Label>
            <Input
              type="text"
              defaultValue={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Birth Date
            </Label>
            {/*
              Docs: https://www.reui.io/docs/date-picker#date
            */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  mode="input"
                  variant="outline"
                  id="date"
                  className={cn(
                    'w-full data-[state=open]:border-primary',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarDays className="-ms-0.5" />
                  {date ? format(date, 'LLL dd, y') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="single" // Single date selection
                  defaultMonth={date}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Availability Date & Time
            </Label>
            {/*
              Docs: https://www.reui.io/docs/date-picker#date--time
            */}
            <Popover>
              <PopoverTrigger asChild>
                <div className="grow relative">
                  <Button
                    type="button"
                    variant="outline"
                    mode="input"
                    placeholder={!date}
                    className="w-full"
                  >
                    <CalendarIcon />
                    {date ? (
                      format(date, 'PPP') +
                      (availabilityTime ? ` - ${availabilityTime}` : '')
                    ) : (
                      <span>Pick a date and time</span>
                    )}
                  </Button>
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex max-sm:flex-col">
                  <Calendar
                    mode="single"
                    selected={availabilityDate}
                    onSelect={(newDate) => {
                      if (newDate) {
                        setAvailabilityDate(newDate);
                        setAvailabilityTime(undefined);
                      }
                    }}
                    className="p-2 sm:pe-5"
                    disabled={[{ before: today }]}
                  />
                  <div className="relative w-full max-sm:h-48 sm:w-40">
                    <div className="absolute inset-0 py-4 max-sm:border-t">
                      <ScrollArea className="h-full sm:border-s">
                        <div className="space-y-3">
                          <div className="flex h-5 shrink-0 items-center px-5">
                            <p className="text-sm font-medium">
                              {date ? format(date, 'EEEE, d') : 'Pick a date'}
                            </p>
                          </div>
                          <div className="grid gap-1.5 px-5 max-sm:grid-cols-2">
                            {availabilityTimeSlots.map(
                              ({ time: timeSlot, available }) => (
                                <Button
                                  key={timeSlot}
                                  variant={
                                    availabilityTime === timeSlot
                                      ? 'primary'
                                      : 'outline'
                                  }
                                  size="sm"
                                  className="w-full"
                                  onClick={() => setAvailabilityTime(timeSlot)}
                                  disabled={!available}
                                >
                                  {timeSlot}
                                </Button>
                              ),
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Company
            </Label>
            <Input
              type="text"
              defaultValue={companyInput}
              onChange={(e) => setCompanyInput(e.target.value)}
            />
          </div>
        </div>

        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Dismissal Time
            </Label>
            {/*
              Docs: 
              https://www.reui.io/docs/input#time
              https://react-spectrum.adobe.com/react-aria/TimeField.html
            */}
            <InputGroup className="w-full">
              <InputAddon mode="icon">
                <Clock3 />
              </InputAddon>
              <TimeField>
                <DateInput />
              </TimeField>
            </InputGroup>
          </div>
        </div>
        <div className="w-full">
          <div className="flex items-baseline flex-wrap lg:flex-nowrap gap-2.5">
            <Label className="flex w-full items-center gap-1 max-w-56">
              Phone number
            </Label>
            <Input
              type="text"
              placeholder="Enter phone"
              defaultValue={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Visibility</Label>
          {/*
            Docs: https://www.reui.io/docs/select
          */}
          <div className="grow">
            <Select defaultValue="1">
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Public</SelectItem>
                <SelectItem value="2">Option 2</SelectItem>
                <SelectItem value="3">Option 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center flex-wrap gap-2.5">
          <Label className="flex w-full max-w-56">Avaibality</Label>
          {/*
            Docs: https://www.reui.io/docs/switch
          */}
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-update" className="text-sm">
              Available to hire
            </Label>
            <Switch defaultChecked size="sm" />
          </div>
        </div>
        <div className="flex justify-end pt-2.5">
          <Button>Save Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export { BasicSettings };
