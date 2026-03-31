export const API_ROUTES = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },
  events: {
    list: "/event",
    byToken: (token: string) => `/event/${token}`,
    create: "/event/create",
    edit: (token: string) => `/event/${token}/edit`,
    myHostingEvents: "/event/my-events/hosting",
    myAttendingEvents: "/event/my-events/attending",
    myPastEvents: "/event/my-events/past",
    requestJoin: (token: string) => `/event/request-join/${token}`,
    approvedParticipants: (token: string) => `/event/${token}/participants/approved`,
    pendingParticipants: (token: string) => `/event/${token}/participants/pending`,
    participantDecision: (token: string, participantId: string, decision: string) =>
      `/event/${token}/participant/${participantId}/${decision}`,
  },
  notifications: {
    list: "/notifications",
    markRead: (id: string | number) => `/notifications/${id}/read`,
  },
  feedback: {
    submit: "/feedback/submit",
  },
  users: {
    byId: (userId: string) => `/user/${userId}`,
  },
} as const;
