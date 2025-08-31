import axios from "axios";
import { GameTurn,GameSession } from "../context/AppContext";
import { Song } from "../components/MusicQuiz";
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
  session:GameSession
}

interface EndSessionResponse{
  turn:GameTurn;
  session:GameSession
}

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

export const createBlobUrl = (arrayBuffer: ArrayBuffer, mimeType: string) => {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
};
