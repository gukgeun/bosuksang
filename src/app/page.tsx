"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, joinRoom } from "@/lib/room";

const NICKNAME_KEY = "bosuksang_nickname";

function readSavedNickname(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NICKNAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function Home() {
  const router = useRouter();
  const [nickname, setNickname] = useState(readSavedNickname);
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function saveNickname(name: string) {
    try {
      window.localStorage.setItem(NICKNAME_KEY, name);
    } catch {
      // ignore (private browsing / storage disabled)
    }
  }

  async function handleCreate() {
    const name = nickname.trim();
    if (!name) {
      setError("닉네임을 입력하세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const code = await createRoom(name);
      saveNickname(name);
      router.push(`/room/${code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "방 생성에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function handleJoin() {
    const name = nickname.trim();
    const code = joinCode.trim().toUpperCase();
    if (!name) {
      setError("닉네임을 입력하세요.");
      return;
    }
    if (!code) {
      setError("방 코드를 입력하세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await joinRoom(code, name);
      saveNickname(name);
      router.push(`/room/${code}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "참가에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 16 }}>
        <h1 style={{ textAlign: "center", margin: 0 }}>보석상</h1>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          닉네임
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="예: 상인김씨"
            style={{ padding: 8, fontSize: 16 }}
          />
        </label>

        <button onClick={handleCreate} disabled={busy} style={{ padding: 12, fontSize: 16 }}>
          방 만들기
        </button>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="방 코드 입력"
            maxLength={5}
            style={{ padding: 8, fontSize: 16, flex: 1, textTransform: "uppercase" }}
          />
          <button onClick={handleJoin} disabled={busy} style={{ padding: 12, fontSize: 16 }}>
            참가하기
          </button>
        </div>

        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
      </div>
    </main>
  );
}
