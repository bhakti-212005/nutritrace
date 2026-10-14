export type AppEventType = 
  | "PRODUCT_CREATED" 
  | "PRODUCT_UPDATED" 
  | "INCIDENT_TRIAGED" 
  | "BATCH_QUARANTINED"
  | "COMPLIANCE_FLAGGED";

export interface AppEvent<T = any> {
  id: string;
  type: AppEventType;
  payload: T;
  timestamp: string;
}

type Listener<T = any> = (event: AppEvent<T>) => void;

/**
 * OBSERVER PATTERN: EventBus
 * Decoupled event-driven architecture for notifications, safety alerts, and batch quarantines.
 */
export class EventBus {
  private listeners: Map<AppEventType, Listener[]> = new Map();
  private history: AppEvent[] = [];

  subscribe<T = any>(type: AppEventType, listener: Listener<T>): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);

    return () => {
      const active = this.listeners.get(type);
      if (active) {
        this.listeners.set(type, active.filter(l => l !== listener));
      }
    };
  }

  publish<T = any>(type: AppEventType, payload: T): AppEvent<T> {
    const event: AppEvent<T> = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      payload,
      timestamp: new Date().toISOString()
    };

    this.history.unshift(event);
    if (this.history.length > 50) this.history.pop();

    const targets = this.listeners.get(type) || [];
    targets.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error(`[EventBus] Error in listener for ${type}:`, err);
      }
    });

    return event;
  }

  getHistory(): AppEvent[] {
    return [...this.history];
  }
}

export const globalEventBus = new EventBus();
