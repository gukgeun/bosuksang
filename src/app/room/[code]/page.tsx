"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GameBoard } from "@/components/GameBoard";
import { ensureSignedIn, startGame, submitAction, subscribeRoom, type RoomDoc } from "@/lib/room";
import type { Action } from "@/game/types";

export default function RoomPage() {
  const params = useParams<{ code: string }>();
  const code = (params.code ?? "").toUpperCase();
  const router = useRouter();

  const [uid, setUid] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomDoc | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    ensureSignedIn()
      .then((user) => setUid(user.uid))
      .catch((e) => setError(e instanceof Error ? e.message : "로그인 실패"));
  }, []);

  useEffect(() => {
    if (!code) return;
    const unsubscribe = subscribeRoom(code, setRoom);
    return unsubscribe;
  }, [code]);

  if (room === undefined || uid === null) {
    return <main style={{ padding: 32 }}>불러오는 중...</main>;
  }

  if (room === null) {
    return (
      <main style={{ padding: 32 }}>
        <p>존재하지 않는 방입니다.</p>
        <button onClick={() => router.push("/")}>홈으로</button>
      </main>
    );
  }

  const me = room.players.find((p) => p.uid === uid);
  const inGame = room.status !== "LOBBY" && !!room.gameState;

  async function handleStart() {
    setStarting(true);
    setError(null);
    try {
      await startGame(code);
    } catch (e) {
      setError(e instanceof Error ? e.message : "게임을 시작할 수 없습니다.");
    } finally {
      setStarting(false);
    }
  }

  async function handleAction(action: Action) {
    await submitAction(code, action);
  }

  return (
    <main
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "6px 12px",
          borderBottom: "1px solid rgba(212, 164, 65, 0.35)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 16 }}>보석상 — 방 {code}</h1>
        <button onClick={() => router.push("/")} style={{ minHeight: 32, padding: "4px 10px", fontSize: 13 }}>
          나가기
        </button>
      </div>

      {error && <p style={{ color: "crimson", padding: "4px 12px", flexShrink: 0 }}>{error}</p>}

      {!me && (
        <p style={{ padding: 16 }}>
          이 방에 참가하지 않은 상태입니다. 홈으로 가서 방 코드 <b>{code}</b>로 참가해주세요.
        </p>
      )}

      {me && room.status === "LOBBY" && (
        <div style={{ padding: 16 }}>
          <p>
            참가자 ({room.players.length}/4): {room.players.map((p) => p.name).join(", ")}
          </p>
          {me.uid === room.hostUid ? (
            <button disabled={starting || room.players.length < 2} onClick={handleStart} style={{ marginTop: 8 }}>
              게임 시작 {room.players.length < 2 ? "(2명 이상 필요)" : ""}
            </button>
          ) : (
            <p>방장이 게임을 시작하기를 기다리는 중...</p>
          )}
        </div>
      )}

      {me && inGame && room.gameState && (
        <div style={{ flex: 1, minHeight: 0, padding: 8 }}>
          <GameBoard state={room.gameState} mySeatIndex={me.seatIndex} onAction={handleAction} />
        </div>
      )}
    </main>
  );
}
