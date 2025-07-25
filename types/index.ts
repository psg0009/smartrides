export type User = {
  id: string;
  name: string;
  email: string;
  university: string;
  avatar: string;
  rating: number;
  verified: boolean;
};

export type RideType = 'carpool' | 'chauffeur';

export type RideStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export type Ride = {
  id: string;
  type: RideType;
  driver: User;
  passengers: User[];
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  status: RideStatus;
  distance: string;
  duration: string;
};

export type Booking = {
  id: string;
  ride: Ride;
  user: User;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
  passengers: number;
  totalPrice: number;
};

export type Message = {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  read: boolean;
};

export type ChatRoom = {
  id: string;
  rideId: string;
  participants: User[];
  lastMessage: Message;
};