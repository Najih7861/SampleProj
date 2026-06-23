import { CalendarDays, Mail, Phone, Send, UserRound, UsersRound } from 'lucide-react'
import { createBooking } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useForm } from '../hooks/useForm'
import { compose, email, numberRange, phone, required } from '../lib/validators'
import { useToast } from './ui/toast/useToast'
import Button from './ui/Button'
import FormActions from './ui/FormActions'
import Input from './ui/Input'
import type { Booking } from '../types'

interface Props {
  packageId: number
  onBooked: (booking: Booking) => void
}

interface BookingFormValues {
  customerName: string
  email: string
  phone: string
  travelDate: string
  numberOfTravelers: number
}

export default function BookingForm({ packageId, onBooked }: Props) {
  const { user } = useAuth()
  const toast = useToast()
  const today = new Date().toISOString().split('T')[0]

  const form = useForm<BookingFormValues>(
    {
      customerName: user?.username ?? '',
      email: user?.email ?? '',
      phone: '',
      travelDate: '',
      numberOfTravelers: 1,
    },
    {
      customerName: required('Please enter your name'),
      email: compose(required(), email()),
      phone: phone(),
      travelDate: required('Choose a travel date'),
      numberOfTravelers: numberRange(1, 100, 'Travelers must be between 1 and 100'),
    },
  )

  const onSubmit = form.handleSubmit(async (values) => {
    const booking = await createBooking({
      tourPackageId: packageId,
      customerName: values.customerName,
      email: values.email,
      phone: values.phone || undefined,
      travelDate: values.travelDate,
      numberOfTravelers: values.numberOfTravelers,
    })
    toast.success('Booking request sent! Check your email for confirmation.')
    onBooked(booking)
  })

  return (
    <form className="form-card booking-form" onSubmit={onSubmit}>
      <h2>Book this tour</h2>
      {form.submitError && <p className="notice notice-error">{form.submitError}</p>}

      <Input
        id="name"
        label={<><UserRound size={15} aria-hidden /> Full name</>}
        required
        value={form.values.customerName}
        onChange={(event) => form.setField('customerName', event.target.value)}
        onBlur={() => form.handleBlur('customerName')}
        error={form.errors.customerName}
        placeholder="Jane Traveler"
      />

      <div className="form-grid">
        <Input
          id="email"
          label={<><Mail size={15} aria-hidden /> Email</>}
          type="email"
          required
          value={form.values.email}
          onChange={(event) => form.setField('email', event.target.value)}
          onBlur={() => form.handleBlur('email')}
          error={form.errors.email}
          placeholder="jane@example.com"
        />
        <Input
          id="phone"
          label={<><Phone size={15} aria-hidden /> Phone</>}
          value={form.values.phone}
          onChange={(event) => form.setField('phone', event.target.value)}
          onBlur={() => form.handleBlur('phone')}
          error={form.errors.phone}
          placeholder="+1 555 123 4567"
        />
      </div>

      <div className="form-grid">
        <Input
          id="date"
          label={<><CalendarDays size={15} aria-hidden /> Travel date</>}
          type="date"
          required
          min={today}
          value={form.values.travelDate}
          onChange={(event) => form.setField('travelDate', event.target.value)}
          onBlur={() => form.handleBlur('travelDate')}
          error={form.errors.travelDate}
        />
        <Input
          id="travelers"
          label={<><UsersRound size={15} aria-hidden /> Travelers</>}
          type="number"
          min={1}
          max={100}
          required
          value={form.values.numberOfTravelers}
          onChange={(event) => form.setField('numberOfTravelers', Number(event.target.value))}
          onBlur={() => form.handleBlur('numberOfTravelers')}
          error={form.errors.numberOfTravelers}
        />
      </div>

      <FormActions align="stretch">
        <Button type="submit" variant="cta" icon={<Send size={17} aria-hidden />} loading={form.submitting} fullWidth>
          Request booking
        </Button>
      </FormActions>
    </form>
  )
}
