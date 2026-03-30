export type EventStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type EventJoinMode = "OPEN" | "APPROVAL_REQUIRED";
export type EventVisibility = "PUBLIC" | "PRIVATE";
export type EventParticipantRole = "HOST" | "CO_HOST" | "COHOST" | "MEMBER";
export type EventParticipantDecision = "approved" | "co_host" | "REJECTED";

export interface EventCreator {
  userId: string;
  name: string;
}

export interface EventItem {
  eventId: string;
  inviteToken: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status: EventStatus;
  joinMode: EventJoinMode;
  visibility: EventVisibility;
  maxParticipants: number;
  creator: EventCreator;
}

export interface PageSort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  sort: PageSort;
  unpaged: boolean;
}

export interface EventListResponse {
  content: EventItem[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  pageable: Pageable;
  size: number;
  sort: PageSort;
  totalElements: number;
  totalPages: number;
}

export interface EventParticipant {
  participantId?: string;
  userId?: string;
  name: string;
  role: EventParticipantRole | string;
  joinedAt: string | null;
}

export interface JoinEventPayload {
  name: string;
  gender: "MALE" | "FEMALE";
  phone: string;
}

export interface JoinEventResponse {
  token: string;
  role: string;
}

export interface PastEventSummary {
  inviteToken: string;
  title: string;
  location: string;
  startTime: string;
}

export interface PaginatedData<T> {
  data: T[];
  hasNext: boolean;
  page: number;
}

export type PaginatedEventData = PaginatedData<EventItem>;
export type PaginatedPastEventData = PaginatedData<PastEventSummary>;
