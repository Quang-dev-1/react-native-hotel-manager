import React, { createContext, useContext, useState } from 'react';

// Types
export interface Room {
    id: number;
    roomNumber: string;
    type: string;
    floor: number;
    price: number;
    status: 'available' | 'occupied' | 'waiting' | 'cleaning';
}

export interface Booking {
    id: number;
    roomNumber: string;
    customerName: string;
    phone: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalAmount: number;
    status: 'active' | 'completed' | 'cancelled';
}

interface BookingStats {
    todayRentals: number;
    waitingRooms: number;
    occupiedRooms: number;
    cleaningRooms: number;
}

interface BookingContextType {
    rooms: Room[];
    bookings: Booking[];
    getBookingStats: () => BookingStats;
    checkOut: (bookingId: number) => void;
    cancelBooking: (bookingId: number) => void;
    addBooking: (booking: Omit<Booking, 'id'>) => void;
    updateRoomStatus: (roomId: number, status: Room['status']) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Mock data
const INITIAL_ROOMS: Room[] = [
    { id: 1, roomNumber: '101', type: 'Standard', floor: 1, price: 500000, status: 'available' },
    { id: 2, roomNumber: '102', type: 'Standard', floor: 1, price: 500000, status: 'occupied' },
    { id: 3, roomNumber: '103', type: 'Deluxe', floor: 1, price: 800000, status: 'available' },
    { id: 4, roomNumber: '104', type: 'Deluxe', floor: 1, price: 800000, status: 'waiting' },
    { id: 5, roomNumber: '201', type: 'Suite', floor: 2, price: 1200000, status: 'cleaning' },
    { id: 6, roomNumber: '202', type: 'Suite', floor: 2, price: 1200000, status: 'available' },
    { id: 7, roomNumber: '203', type: 'Standard', floor: 2, price: 500000, status: 'occupied' },
    { id: 8, roomNumber: '204', type: 'Deluxe', floor: 2, price: 800000, status: 'available' },
];

const INITIAL_BOOKINGS: Booking[] = [
    {
        id: 1,
        roomNumber: '102',
        customerName: 'Nguyễn Văn A',
        phone: '0901234567',
        checkIn: '15/12/2025',
        checkOut: '18/12/2025',
        nights: 3,
        totalAmount: 1500000,
        status: 'active',
    },
    {
        id: 2,
        roomNumber: '203',
        customerName: 'Trần Thị B',
        phone: '0912345678',
        checkIn: '16/12/2025',
        checkOut: '20/12/2025',
        nights: 4,
        totalAmount: 2000000,
        status: 'active',
    },
];

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
    const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);

    const getBookingStats = (): BookingStats => {
        const activeBookings = bookings.filter(b => b.status === 'active');
        return {
            todayRentals: activeBookings.length,
            waitingRooms: rooms.filter(r => r.status === 'waiting').length,
            occupiedRooms: rooms.filter(r => r.status === 'occupied').length,
            cleaningRooms: rooms.filter(r => r.status === 'cleaning').length,
        };
    };

    const checkOut = (bookingId: number) => {
        setBookings(prev =>
            prev.map(booking =>
                booking.id === bookingId
                    ? { ...booking, status: 'completed' as const }
                    : booking
            )
        );

        // Update room status to cleaning
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            const room = rooms.find(r => r.roomNumber === booking.roomNumber);
            if (room) {
                updateRoomStatus(room.id, 'cleaning');
            }
        }
    };

    const cancelBooking = (bookingId: number) => {
        setBookings(prev =>
            prev.map(booking =>
                booking.id === bookingId
                    ? { ...booking, status: 'cancelled' as const }
                    : booking
            )
        );

        // Update room status to available
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
            const room = rooms.find(r => r.roomNumber === booking.roomNumber);
            if (room) {
                updateRoomStatus(room.id, 'available');
            }
        }
    };

    const addBooking = (booking: Omit<Booking, 'id'>) => {
        const newBooking: Booking = {
            ...booking,
            id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
        };
        setBookings(prev => [...prev, newBooking]);

        // Update room status to occupied
        const room = rooms.find(r => r.roomNumber === booking.roomNumber);
        if (room) {
            updateRoomStatus(room.id, 'occupied');
        }
    };

    const updateRoomStatus = (roomId: number, status: Room['status']) => {
        setRooms(prev =>
            prev.map(room =>
                room.id === roomId ? { ...room, status } : room
            )
        );
    };

    const value: BookingContextType = {
        rooms,
        bookings,
        getBookingStats,
        checkOut,
        cancelBooking,
        addBooking,
        updateRoomStatus,
    };

    return (
        <BookingContext.Provider value={value}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}