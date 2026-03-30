import { API_ROUTES } from "@/config/api-routes";
import { apiClient } from "@/lib/api/client";
import { unwrapApiResponse } from "@/lib/utils/api-response";
import type { ApiEnvelope } from "@/types/api.types";
import type {
  EventParticipantDecision,
  EventItem,
  EventListResponse,
  EventParticipant,
  JoinEventPayload,
  JoinEventResponse,
  PaginatedData,
  PaginatedPastEventData,
  PastEventSummary,
} from "@/features/events/types/event.types";

const normalizeParticipant = (participant: Record<string, unknown>): EventParticipant => {
  const participantId =
    (typeof participant.participantId === "string" && participant.participantId) ||
    (typeof participant.userId === "string" && participant.userId) ||
    (typeof participant.id === "string" && participant.id) ||
    undefined;

  return {
    participantId,
    userId:
      (typeof participant.userId === "string" && participant.userId) ||
      (typeof participant.participantId === "string" && participant.participantId) ||
      (typeof participant.id === "string" && participant.id) ||
      undefined,
    name: typeof participant.name === "string" ? participant.name : "Unknown User",
    role: typeof participant.role === "string" ? participant.role : "MEMBER",
    joinedAt: typeof participant.joinedAt === "string" || participant.joinedAt === null ? participant.joinedAt : null,
  };
};

const normalizePaginatedData = <T>(payload: unknown): PaginatedData<T> => {
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      hasNext: false,
      page: 0,
    };
  }

  if (!payload || typeof payload !== "object") {
    return {
      data: [],
      hasNext: false,
      page: 0,
    };
  }

  const raw = payload as {
    data?: EventItem[];
    content?: EventItem[];
    items?: EventItem[];
    page?: number;
    pageNumber?: number;
    number?: number;
    hasNext?: boolean;
    last?: boolean;
  };

  const data = raw.data ?? raw.content ?? raw.items ?? [];
  const page = raw.page ?? raw.pageNumber ?? raw.number ?? 0;
  const hasNext = typeof raw.hasNext === "boolean" ? raw.hasNext : typeof raw.last === "boolean" ? !raw.last : false;

  return {
    data: data as T[],
    hasNext,
    page,
  };
};

export const eventsApi = {
  async list(): Promise<EventListResponse> {
    const response = await apiClient.get<ApiEnvelope<EventListResponse> | EventListResponse>(API_ROUTES.events.list);
    return unwrapApiResponse(response.data);
  },

  async byToken(token: string): Promise<EventItem | null> {
    const response = await apiClient.get<ApiEnvelope<EventItem> | EventItem>(API_ROUTES.events.byToken(token));
    return unwrapApiResponse(response.data);
  },

  async approvedParticipants(token: string): Promise<EventParticipant[]> {
    const response = await apiClient.get<ApiEnvelope<EventParticipant[]> | EventParticipant[]>(
      API_ROUTES.events.approvedParticipants(token),
    );
    return unwrapApiResponse(response.data).map((participant) =>
      normalizeParticipant(participant as unknown as Record<string, unknown>),
    );
  },

  async pendingParticipants(token: string): Promise<EventParticipant[]> {
    const response = await apiClient.get<ApiEnvelope<EventParticipant[]> | EventParticipant[]>(
      API_ROUTES.events.pendingParticipants(token),
    );
    return unwrapApiResponse(response.data).map((participant) =>
      normalizeParticipant(participant as unknown as Record<string, unknown>),
    );
  },

  async requestJoin(token: string, payload: JoinEventPayload): Promise<JoinEventResponse> {
    const response = await apiClient.post<ApiEnvelope<JoinEventResponse> | JoinEventResponse>(
      API_ROUTES.events.requestJoin(token),
      payload,
    );
    return unwrapApiResponse(response.data);
  },

  async participantDecision(token: string, participantId: string, decision: EventParticipantDecision) {
    const response = await apiClient.put<ApiEnvelope<unknown> | unknown>(
      API_ROUTES.events.participantDecision(token, participantId, decision),
    );
    return unwrapApiResponse(response.data);
  },

  async myHostingEvents(page = 0): Promise<EventListResponse> {
    const response = await apiClient.get<ApiEnvelope<EventListResponse> | EventListResponse>(
      API_ROUTES.events.myHostingEvents,
      {
        params: {
          page,
        },
      },
    );
    return unwrapApiResponse(response.data);
  },

  async myAttendingEvents(page = 0): Promise<EventListResponse> {
    const response = await apiClient.get<ApiEnvelope<EventListResponse> | EventListResponse>(
      API_ROUTES.events.myAttendingEvents,
      {
        params: {
          page,
        },
      },
    );
    return unwrapApiResponse(response.data);
  },

  async myPastEvents(page = 0): Promise<PaginatedPastEventData> {
    const response = await apiClient.get<ApiEnvelope<unknown> | unknown>(API_ROUTES.events.myPastEvents, {
      params: {
        page,
      },
    });
    const payload = unwrapApiResponse(response.data);
    return normalizePaginatedData<PastEventSummary>(payload);
  },

};
