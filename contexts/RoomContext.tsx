// contexts/RoomContext.tsx
import React, { createContext, ReactNode, useContext, useState } from 'react';

export interface RoomType {
    id: string;
    name: string;
    price: number;
    capacity: number;
    description: string;
}

export interface Room {
    id: number;
    roomNumber: string;
    type: string;
    floor: number;
    price: number;
    status: 'available' | 'occupied' | 'waiting' | 'cleaning';
}

interface RoomContextType {
    rooms: Room[];
    roomTypes: RoomType[];
    addRoom: (room: Omit<Room, 'id' | 'status'>) => void;
    addRoomType: (roomType: Omit<RoomType, 'id'>) => void;
    updateRoomStatus: (roomNumber: string, status: Room['status']) => void;
    getRoomByNumber: (roomNumber: string) => Room | undefined;
    getRoomTypeByName: (name: string) => RoomType | undefined;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

// Initial room types
const initialRoomTypes: RoomType[] = [
    {
        id: '1',
        name: 'Tiêu chuẩn',
        price: 500000,
        capacity: 2,
        description: 'Phòng tiêu chuẩn với đầy đủ tiện nghi',
    },
    {
        id: '2',
        name: 'Cao cấp',
        price: 800000,
        capacity: 2,
        description: 'Phòng cao cấp với view đẹp',
    },
    {
        id: '3',
        name: 'Suite',
        price: 1200000,
        capacity: 4,
        description: 'Phòng suite rộng rãi, sang trọng',
    },
    {
        id: '4',
        name: 'VIP',
        price: 2000000,
        capacity: 4,
        description: 'Phòng VIP cao cấp nhất',
    },
];

// Initial rooms
const initialRooms: Room[] = [
    { id: 1, roomNumber: '101', type: 'Tiêu chuẩn', floor: 1, price: 500000, status: 'available' },
    { id: 2, roomNumber: '102', type: 'Tiêu chuẩn', floor: 1, price: 500000, status: 'occupied' },
    { id: 3, roomNumber: '103', type: 'Cao cấp', floor: 1, price: 800000, status: 'available' },
    { id: 4, roomNumber: '201', type: 'Cao cấp', floor: 2, price: 800000, status: 'waiting' },
    { id: 5, roomNumber: '202', type: 'Suite', floor: 2, price: 1200000, status: 'available' },
    { id: 6, roomNumber: '203', type: 'Suite', floor: 2, price: 1200000, status: 'cleaning' },
    { id: 7, roomNumber: '301', type: 'VIP', floor: 3, price: 2000000, status: 'available' },
    { id: 8, roomNumber: '302', type: 'VIP', floor: 3, price: 2000000, status: 'available' },
];

export function RoomProvider({ children }: { children: ReactNode }) {
    const [rooms, setRooms] = useState<Room[]>(initialRooms);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);

    const addRoom = (newRoom: Omit<Room, 'id' | 'status'>) => {
        const maxId = rooms.reduce((max, room) => Math.max(max, room.id), 0);
        const room: Room = {
            ...newRoom,
            id: maxId + 1,
            status: 'available',
        };
        setRooms([...rooms, room]);
    };

    const addRoomType = (newRoomType: Omit<RoomType, 'id'>) => {
        const maxId = roomTypes.reduce((max, rt) => {
            const numId = parseInt(rt.id);
            return Math.max(max, isNaN(numId) ? 0 : numId);
        }, 0);
        const roomType: RoomType = {
            ...newRoomType,
            id: (maxId + 1).toString(),
        };
        setRoomTypes([...roomTypes, roomType]);
    };

    const updateRoomStatus = (roomNumber: string, status: Room['status']) => {
        setRooms(rooms.map(room =>
            room.roomNumber === roomNumber ? { ...room, status } : room
        ));
    };

    const getRoomByNumber = (roomNumber: string) => {
        return rooms.find(room => room.roomNumber === roomNumber);
    };

    const getRoomTypeByName = (name: string) => {
        return roomTypes.find(rt => rt.name === name);
    };

    return (
        <RoomContext.Provider
            value={{
                rooms,
                roomTypes,
                addRoom,
                addRoomType,
                updateRoomStatus,
                getRoomByNumber,
                getRoomTypeByName,
            }}>
            {children}
        </RoomContext.Provider>
    );
}

export function useRoom() {
    const context = useContext(RoomContext);
    if (context === undefined) {
        throw new Error('useRoom must be used within a RoomProvider');
    }
    return context;
}