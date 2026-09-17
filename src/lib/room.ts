import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
} from "firebase/firestore";
import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth, db } from "./firebase";
import { applyAction } from "@/game/engine";
import { createInitialState } from "@/game/setup";
import type { Action, GameState } from "@/game/types";

export interface RoomPlayer {
  uid: string;
  name: string;
  seatIndex: number;
}

export type RoomStatus = "LOBBY" | "PLAYING" | "FINISHED";

export interface RoomDoc {
  code: string;
  hostUid: string;
  status: RoomStatus;
  players: RoomPlayer[];
  gameState: GameState | null;
  createdAt: number;
}

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
const ROOM_CODE_LENGTH = 5;
const MAX_PLAYERS = 4;

function randomRoomCode(): string {
  let code = "";
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export function ensureSignedIn(): Promise<User> {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        if (user) {
          resolve(user);
        } else {
          signInAnonymously(auth)
            .then((credential) => resolve(credential.user))
            .catch(reject);
        }
      },
      reject,
    );
  });
}

export async function createRoom(nickname: string): Promise<string> {
  const user = await ensureSignedIn();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomRoomCode();
    const ref = doc(db, "rooms", code);
    const existing = await getDoc(ref);
    if (existing.exists()) continue;

    const room: RoomDoc = {
      code,
      hostUid: user.uid,
      status: "LOBBY",
      players: [{ uid: user.uid, name: nickname, seatIndex: 0 }],
      gameState: null,
      createdAt: Date.now(),
    };
    await setDoc(ref, room);
    return code;
  }

  throw new Error("방 코드를 생성하지 못했습니다. 다시 시도해주세요.");
}

export async function joinRoom(code: string, nickname: string): Promise<void> {
  const user = await ensureSignedIn();
  const ref = doc(db, "rooms", code.toUpperCase());

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error("존재하지 않는 방 코드입니다.");
    }
    const room = snap.data() as RoomDoc;
    if (room.players.some((p) => p.uid === user.uid)) {
      return; // already in the room (e.g. page refresh) — no-op
    }
    if (room.status !== "LOBBY") {
      throw new Error("이미 시작된 게임입니다.");
    }
    if (room.players.length >= MAX_PLAYERS) {
      throw new Error("방 인원이 가득 찼습니다 (최대 4명).");
    }
    const seatIndex = room.players.length;
    tx.update(ref, { players: [...room.players, { uid: user.uid, name: nickname, seatIndex }] });
  });
}

export function subscribeRoom(code: string, callback: (room: RoomDoc | null) => void): () => void {
  const ref = doc(db, "rooms", code.toUpperCase());
  return onSnapshot(ref, (snap) => {
    callback(snap.exists() ? (snap.data() as RoomDoc) : null);
  });
}

export async function startGame(code: string): Promise<void> {
  const ref = doc(db, "rooms", code.toUpperCase());

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error("존재하지 않는 방입니다.");
    }
    const room = snap.data() as RoomDoc;
    if (room.status !== "LOBBY") {
      throw new Error("이미 시작되었습니다.");
    }
    if (room.players.length < 2) {
      throw new Error("최소 2명이 필요합니다.");
    }
    const ordered = [...room.players].sort((a, b) => a.seatIndex - b.seatIndex);
    const initialState = createInitialState(ordered.map((p) => p.name));
    tx.update(ref, { status: "PLAYING", gameState: initialState });
  });
}

export async function submitAction(code: string, action: Action): Promise<void> {
  const user = await ensureSignedIn();
  const ref = doc(db, "rooms", code.toUpperCase());

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      throw new Error("존재하지 않는 방입니다.");
    }
    const room = snap.data() as RoomDoc;
    if (room.status !== "PLAYING" || !room.gameState) {
      throw new Error("게임이 진행 중이 아닙니다.");
    }
    const ordered = [...room.players].sort((a, b) => a.seatIndex - b.seatIndex);
    const actingPlayer = ordered[room.gameState.currentPlayerIndex];
    if (actingPlayer?.uid !== user.uid) {
      throw new Error("당신의 차례가 아닙니다.");
    }
    const nextState = applyAction(room.gameState, action);
    tx.update(ref, {
      gameState: nextState,
      status: nextState.phase === "GAME_OVER" ? "FINISHED" : "PLAYING",
    });
  });
}
