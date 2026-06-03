import { getDb } from './mongodb';
import { UserMemory, Message, Theme, Tab, RoadmapItem } from './types';
import { ObjectId } from 'mongodb';

const COLLECTION = 'memories';

export async function getMemory(userId: string): Promise<UserMemory | null> {
  const db = await getDb();
  return db.collection<UserMemory>(COLLECTION).findOne({ userId });
}

export async function initMemory(userId: string, name: string): Promise<UserMemory> {
  const db = await getDb();
  const memory: UserMemory = {
    userId,
    profile: {
      name,
      joinedAt: new Date(),
      lastActive: new Date(),
    },
    conversations: [],
    themes: [],
    tabs: [],
    roadmap: [],
    rawFacts: [],
    emergentData: {},
    updatedAt: new Date(),
  };
  await db.collection<UserMemory>(COLLECTION).insertOne(memory);
  return memory;
}

export async function appendMessage(userId: string, message: Message): Promise<void> {
  const db = await getDb();
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId },
    {
      $push: { conversations: message as never },
      $set: { 'profile.lastActive': new Date(), updatedAt: new Date() },
    }
  );
}

export async function updateThemes(userId: string, themes: Theme[]): Promise<void> {
  const db = await getDb();
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId },
    { $set: { themes, updatedAt: new Date() } }
  );
}

export async function approveTab(userId: string, tab: Tab): Promise<void> {
  const db = await getDb();
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId },
    {
      $push: { tabs: tab as never },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function updateRoadmap(userId: string, items: RoadmapItem[]): Promise<void> {
  const db = await getDb();
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId },
    { $set: { roadmap: items, updatedAt: new Date() } }
  );
}

export async function addRoadmapItem(userId: string, item: RoadmapItem): Promise<void> {
  const db = await getDb();
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId },
    {
      $push: { roadmap: item as never },
      $set: { updatedAt: new Date() },
    }
  );
}

export async function updateRoadmapItemStatus(
  userId: string,
  itemId: string,
  status: RoadmapItem['status']
): Promise<void> {
  const db = await getDb();
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId, 'roadmap.id': itemId },
    {
      $set: {
        'roadmap.$.status': status,
        'roadmap.$.updatedAt': new Date(),
        updatedAt: new Date(),
      },
    }
  );
}

export async function updateEmergentData(
  userId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): Promise<void> {
  const db = await getDb();
  const setFields: Record<string, unknown> = { updatedAt: new Date() };
  for (const [key, value] of Object.entries(data)) {
    setFields[`emergentData.${key}`] = value;
  }
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId },
    { $set: setFields }
  );
}

export async function savePushSubscription(
  userId: string,
  subscription: UserMemory['pushSubscription']
): Promise<void> {
  const db = await getDb();
  await db.collection<UserMemory>(COLLECTION).updateOne(
    { userId },
    { $set: { pushSubscription: subscription, updatedAt: new Date() } }
  );
}

export function generateId(): string {
  return new ObjectId().toHexString();
}
