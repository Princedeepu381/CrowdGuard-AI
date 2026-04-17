// Firebase Realtime Database service for CrowdGuard-AI
// Handles real-time persistence of incident events and telemetry snapshots
import { ref, push, onValue, query, limitToLast, DataSnapshot, DatabaseReference, off } from 'firebase/database';
import { db } from './firebase';
import { IncidentEvent } from '../types';

const INCIDENTS_REF = 'crowdguard/incidents';
const TELEMETRY_REF = 'crowdguard/telemetry_snapshots';

/**
 * Pushes a new incident event to Firebase Realtime Database.
 * Gracefully handles network failures without crashing the app.
 */
export const logIncidentToFirebase = async (event: IncidentEvent): Promise<void> => {
  try {
    const incidentsRef: DatabaseReference = ref(db, INCIDENTS_REF);
    await push(incidentsRef, {
      ...event,
      pushTimestamp: Date.now(),
    });
  } catch (error) {
    // Firebase write failed — app continues with in-memory fallback
    console.warn('[CrowdGuard] Firebase write failed (offline mode):', error);
  }
};

/**
 * Subscribes to live incident log from Firebase.
 * Returns an unsubscribe function for cleanup.
 */
export const subscribeToIncidents = (
  callback: (events: IncidentEvent[]) => void
): (() => void) => {
  try {
    const incidentsQuery = query(ref(db, INCIDENTS_REF), limitToLast(100));
    onValue(incidentsQuery, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (!data) { callback([]); return; }
      const events: IncidentEvent[] = Object.values(data) as IncidentEvent[];
      callback(events.reverse());
    });
    return () => off(ref(db, INCIDENTS_REF));
  } catch (error) {
    console.warn('[CrowdGuard] Firebase subscription failed (offline mode):', error);
    return () => {};
  }
};

/**
 * Saves a telemetry snapshot to Firebase for audit trail purposes.
 */
export const saveTelemetrySnapshot = async (snapshot: object): Promise<void> => {
  try {
    const snapshotRef: DatabaseReference = ref(db, TELEMETRY_REF);
    await push(snapshotRef, {
      data: snapshot,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.warn('[CrowdGuard] Firebase telemetry snapshot failed (offline mode):', error);
  }
};
