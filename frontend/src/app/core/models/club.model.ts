export interface ClubCoach {
  id: number;
  name?: string;
  email?: string;
}

export interface ClubFighter {
  id: number;
  name: string;
  nickname?: string;
  country?: string;
  image?: string | null;
  weightClass?: string;
}

export interface Club {
  id: number;
  name: string;
  country: string;
  city: string;
  logo: string | null;
  description: string | null;
  coach: ClubCoach | null;
  fighters: ClubFighter[];
  createdAt: string;
  updatedAt: string;
}