// src/lib/table-session.ts

export interface TableSession {
  tableCode: string;
  sessionId?: string;
  tableNumber?: string;
  restaurantSlug?: string;
  restaurantId?: string;
  createdAt: number;
}

const STORAGE_KEY = "tavolarapida_table_session";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 ore

// ─── Utilities ────────────────────────────────────────────────────────────────

function stripUndefined(obj: Partial<TableSession>): Partial<TableSession> {
  const result: Partial<TableSession> = {};
  for (const key in obj) {
    const k = key as keyof TableSession;
    if (obj[k] !== undefined) {
      (result as any)[k] = obj[k];
    }
  }
  return result;
}

// ─── API Core ────────────────────────────────────────────────────────────────

export const saveTableSession = (session: Partial<TableSession>) => {
  if (typeof window === "undefined") return;

  try {
    const current = getTableSession();

    const newSession: TableSession = {
      tableCode: "",
      createdAt: current?.createdAt ?? Date.now(),
      ...current,
      ...stripUndefined(session),
    };

    if (!newSession.tableCode && process.env.NODE_ENV === "development") {
      console.warn("saveTableSession: tableCode e' vuoto", session);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
  } catch (e) {
    console.error("Failed to save table session:", e);
  }
};

export const getTableSession = (): TableSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const session: TableSession = JSON.parse(stored);

    if (Date.now() - session.createdAt > SESSION_DURATION_MS) {
      clearTableSession();
      return null;
    }

    return session;
  } catch (e) {
    console.error("Failed to parse table session:", e);
    clearTableSession();
    return null;
  }
};

export const clearTableSession = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear table session:", e);
  }
};

// ─── Helper Semplificati ─────────────────────────────────────────────────────

export const saveTableToken = (token: string) => {
  saveTableSession({ tableCode: token });
};

export const getTableToken = (): string | null => {
  const session = getTableSession();
  return session?.sessionId || session?.tableCode || null;
};

export const getMenuHref = (): string => {
  const token = getTableToken();
  return token ? `/order/${token}` : "/";
};