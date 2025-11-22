import axios from "axios";
import { GameTurn,GameSession } from "../context/AppContext";
import { Song } from "../components/MusicQuiz";
import { User } from "../context/AuthContex";
const backendIp = import.meta.env.VITE_BACKEND_IP;

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

interface GuessResponse {
  isEnded: boolean;
  turn: GameTurn;
  session: GameSession;
}

interface NextResponse{
  new_turn:GameTurn;
  preloaded_turn:GameTurn;
  session:GameSession
}

interface EndSessionResponse{
  turn:GameTurn;
  session:GameSession
}

export interface TopWeekScore{
  score:number;
  user:User
}
export const createBlobUrl = (arrayBuffer: ArrayBuffer, mimeType: string) => {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
};

export interface PreviousSessionResults{
  session_id:number;
  score:number;
  last_correct_song:Song
}
// Helper to inject Authorization header from stored token
const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchCsrfToken = async (): Promise<number> => {
  const csrfTokenResponse = await axios.get(
    `${import.meta.env.VITE_BACKEND_IP}/core/csrf/`
  );
  return csrfTokenResponse.data.csrfToken
};

export const fetchSongWithName = async (songName: string) => {
  const response = await axios.get(
    `${backendIp}/ts/songs/?song_name=${songName}`
  );
  return response.data;
};

export const fetchSongWithId = async (id: string) => {
  const response = await axios.get(`${backendIp}/ts/songs/${id}/`);
  return response.data;
};
export const fetchRandomSong = async (album?: string) => {
  const response = await axios.get(`${backendIp}/ts/songs/random_song/`, {
    params: { album },
  });
  return response.data;
};

export const fetchRandomSongStartFromTime = async (
  url: string,
  startTimeInSeconds: number
) => {
  const startByte = (startTimeInSeconds * 128 * 1024) / 8;
  const response = await axios.get(url, {
    headers: {
      Range: `bytes=${startByte}-`,
    },
    responseType: "arraybuffer",
  });
  return response.data;
};

export const fetchRandomTitles = async () => {
  const response = await axios.get(`${backendIp}/ts/random-titles/`);
  return response.data;
};

export const fetchPosterById = async (id: string) => {
  const response = await axios.get(`${backendIp}/ts/posters/${id}/`);
  return response.data;
};

// Game Session APIs
export const startGameSession = async ():Promise<GameSession> => {
  const res = await axios.post(`${backendIp}/ts/game-sessions/`, null, {
    headers: { ...authHeaders() },
  });
  return res.data.session; // expects session with current_turn
};


export const fetchGameSession = async (sessionId: number):Promise<GameSession> => {
  const response = await axios.get(`${backendIp}/ts/game-sessions/${sessionId}/`);
  return response.data;
}

export const fetchGameTurn = async (turnId: number): Promise<GameTurn> => {
  const response = await axios.get(`${backendIp}/ts/game-turns/${turnId}/`);
  return response.data;
};

export const submitGuess = async (
  sessionId: number,
  payload: {
    turn_id: number;
    option: string;
    version: number;
    client_time_left?: number;
  }
):Promise<GuessResponse> => {
  const res = await axios.post(
    `${backendIp}/ts/game-sessions/${sessionId}/guess/`,
    payload,
    { headers: { ...authHeaders() } }
  );
  return res.data; // { session, turn, poster_url, ended }
};

export const fetchNextTurn = async (
  sessionId: number,
  payload: { version: number }
):Promise<NextResponse> => {
  const res = await axios.post(
    `${backendIp}/ts/game-sessions/${sessionId}/next-turn/`,
    payload,
    { headers: { ...authHeaders() } }
  );
  return res.data; // { session, turn, ended }
};

export const endGameSession = async (
  sessionId: number,
  payload: { version: number }
):Promise<EndSessionResponse> => {
  const res = await axios.post(
    `${backendIp}/ts/game-sessions/${sessionId}/end-session/`,
    payload,
    { headers: { ...authHeaders() } }
  );
  return res.data;
};

export const fetchPreviousSessionResults = async (page:number):Promise<PaginatedResponse<PreviousSessionResults>> => {
  const res = await axios.get(`${backendIp}/ts/game-sessions/previous-results/`, {
    headers: { ...authHeaders() },
    params: { page }
  });
  return res.data;
};

export const fetchTopWeekScore = async ():Promise<TopWeekScore[]> =>{
  const res = await axios.get(`${backendIp}/ts/game-sessions/top-week-scores/`, {
    headers: { ...authHeaders() }
  });
  return res.data
}

export const fetchTotalGamesPlayed = async (): Promise<number> => {
  const res = await axios.get(`${backendIp}/ts/game-sessions/total-played/`, {
    headers: { ...authHeaders() },
  });
  return res.data.total_played as number;
};

// Core User APIs
export interface UpdateUserPayload {
  username?: string;
  email?: string;
  password?: string;
  avatar?: File | null;
}

export const updateUserProfile = async (
  userId: string | number,
  data: UpdateUserPayload
) => {
  const hasFile = !!data.avatar;
  if (hasFile) {
    const form = new FormData();
    if (data.username !== undefined) form.append("username", data.username);
    if (data.email !== undefined) form.append("email", data.email);
    if (data.password) form.append("password", data.password);
    if (data.avatar) form.append("avatar", data.avatar);
    const res = await axios.patch(`${backendIp}/core/users/${userId}/`, form, {
      headers: {
        ...authHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } else {
    const payload: Record<string, any> = {};
    if (data.username !== undefined) payload.username = data.username;
    if (data.email !== undefined) payload.email = data.email;
    if (data.password) payload.password = data.password;
    const res = await axios.patch(
      `${backendIp}/core/users/${userId}/`,
      payload,
      {
        headers: { ...authHeaders() },
      }
    );
    return res.data;
  }
};

// Multiplayer Room APIs
export interface Room {
  id: number | string;
  status: "WAITING" | "IN_GAME" | "FINISHED" | string;
  player_1: number | null;
  player_2: number | null;
  player_1_score: number;
  player_2_score: number;
  current_song: number | null;
  is_full?: boolean;
  members?: number;
  created_at: string;
  updated_at: string;
}

export const fetchWaitingRooms = async (): Promise<Room[]> => {
  const res = await axios.get(`${backendIp}/ts/game-rooms/`, {
    headers: { ...authHeaders() },
    params: { status: "WAITING" },
  });
  const data = res.data as any;
  return Array.isArray(data) ? data : (data.results ?? []);
};

export const createRoom = async (): Promise<Room> => {
  const res = await axios.post(
    `${backendIp}/ts/game-rooms/`,
    {},
    { headers: { ...authHeaders() } }
  );
  return res.data as Room;
};

export const joinRoom = async (roomId: number): Promise<Room> => {
  const res = await axios.post(
    `${backendIp}/ts/game-rooms/${roomId}/join/`,
    null,
    { headers: { ...authHeaders() } }
  );
  return res.data as Room;
};


