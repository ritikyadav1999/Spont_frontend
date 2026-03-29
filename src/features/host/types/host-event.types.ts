export type EventStatus = "SCHEDULED" | "ONGOING" | "CANCELLED" | "COMPLETED";
export type JoinMode = "OPEN" | "APPROVAL_REQUIRED";
export type Visibility = "PUBLIC" | "PRIVATE";

export interface CreateEventPayload {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status: EventStatus;
  joinMode: JoinMode;
  visibility: Visibility;
  maxParticipants: number;
}

export interface LocationSearchResult {
  displayName: string;
  latitude: number;
  longitude: number;
}
