import { PixiCalendar } from './components/PixiCalendar/PixiCalendar'

import dayjs from 'dayjs';
import { Booking, Group, Customer } from './types/types';
import { HTMLCalendar } from './components/HTMLCalendar/HTMLCalendar';

// Generate dummy groups
export const dummyGroups: Group[] = [
  { id: 'g1', name: 'Room 101' },
  { id: 'g2', name: 'Room 102' },
  { id: 'g3', name: 'Room 103' },
  { id: 'g4', name: 'Room 104' },
  { id: 'g5', name: 'Room 105' },
];

// Generate dummy customers
export const dummyCustomers: Customer[] = [
  { id: 'c1', name: 'John Doe' },
  { id: 'c2', name: 'Jane Smith' },
  { id: 'c3', name: 'Alice Johnson' },
  { id: 'c4', name: 'Bob Wilson' },
  { id: 'c5', name: 'Carol Brown' },
];

// Generate dummy bookings
export const dummyBookings: Booking[] = [
  {
    id: 'b1',
    groupId: 'g1',
    customerId: 'c1',
    startDate: dayjs().subtract(2, 'days'),
    endDate: dayjs().add(3, 'days'),
  },
  {
    id: 'b2',
    groupId: 'g2',
    customerId: 'c2',
    startDate: dayjs().add(1, 'week'),
    endDate: dayjs().add(2, 'weeks'),
  },
  {
    id: 'b3',
    groupId: 'g3',
    customerId: 'c3',
    startDate: dayjs().add(3, 'days'),
    endDate: dayjs().add(5, 'days'),
  },
  {
    id: 'b4',
    groupId: 'g4',
    customerId: 'c4',
    startDate: dayjs().add(2, 'weeks'),
    endDate: dayjs().add(3, 'weeks'),
  },
];

// Booking handler function
export const handleAddBooking = (groupId: string, date: dayjs.Dayjs) => {
  console.log(`New booking requested for group ${groupId} on ${date.format('YYYY-MM-DD')}`);
};

function App() {

  return (
    <>
      <PixiCalendar 
        bookings={dummyBookings}
        groups={dummyGroups}
        onAddBooking={handleAddBooking}
      />
      <div className='mb-[300px]'></div>
      <HTMLCalendar
        bookings={dummyBookings}
        groups={dummyGroups}
        onAddBooking={handleAddBooking}
      />
    </>
  )
}

export default App
