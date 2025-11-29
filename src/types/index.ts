import type { Event, Participant, Room, Workshop, WorkshopLeader, WorkshopParticipant } from "@prisma/client";

export type { Event, Participant, Room, Workshop, WorkshopLeader, WorkshopParticipant };

// Rolle als String-Union (SQLite unterstützt keine Enums)
export type ParticipantRole = "REGULAR" | "HELPER" | "ABI";

// Zahlungsmethode
export type PaymentMethod = "CASH" | "TRANSFER";

export type ParticipantWithRoom = Participant & {
  room: Room | null;
};

export type RoomWithParticipants = Room & {
  participants: Participant[];
};

export type EventWithDetails = Event & {
  participants: ParticipantWithRoom[];
  rooms: RoomWithParticipants[];
};

export interface CityStatistic {
  city: string;
  count: number;
  percentage: number;
}

export interface CountryStatistic {
  country: string;
  count: number;
  percentage: number;
}

export interface PaymentStatistic {
  paid: number;
  unpaid: number;
  totalAmount: number;
}

export interface RoleStatistic {
  regular: number;
  helper: number;
  abi: number;
}

export interface DashboardStats {
  totalParticipants: number;
  checkedIn: number;
  paid: number;
  unpaid: number;
  rooms: number;
  occupiedBeds: number;
  totalBeds: number;
  helpers: number;
  abiGuests: number;
}

export interface DailyReport {
  date: Date;
  rooms: RoomWithParticipants[];
  presentParticipants: Participant[];
  arrivals: Participant[];
  departures: Participant[];
}

// Workshop Types
export type WorkshopWithDetails = Workshop & {
  leaders: (WorkshopLeader & { participant: Participant })[];
  participants: (WorkshopParticipant & { participant: Participant })[];
};

export type WorkshopLeaderWithParticipant = WorkshopLeader & {
  participant: Participant;
};

export type WorkshopParticipantWithDetails = WorkshopParticipant & {
  participant: Participant;
};
