export interface AnimalRecord {
  id: string;
  imageUri: string;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface DraftAnimal {
  imageUri: string;
  latitude: number;
  longitude: number;
}
