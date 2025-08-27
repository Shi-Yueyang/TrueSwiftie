import axios from "axios";

const backendIp = import.meta.env.VITE_BACKEND_IP;

// Helper to inject Authorization header from stored token
const authHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchSongWithName = async (songName: string) => {
  const response = await axios.get(
    `${backendIp}/ts/songs/?song_name=${songName}`
  );
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
export const startGameSession = async () => {
  const res = await axios.post(`${backendIp}/ts/game-sessions/`, null,{
    headers: { ...authHeaders() },
  });
  return res.data.session; // expects session with current_turn
};

export const submitGuess = async (
  sessionId: number,
  payload: {
    turn_id: number;
    option: string;
    version: number;
    client_time_left?: number;
  }
) => {
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
) => {
  const res = await axios.post(
    `${backendIp}/ts/game-sessions/${sessionId}/next/`,
    payload,
    { headers: { ...authHeaders() } }
  );
  return res.data; // { session, turn, ended }
};

export const endGameSession = async (
  sessionId: number,
  payload: { version: number }
) => {
  const res = await axios.post(
    `${backendIp}/ts/game-sessions/${sessionId}/end/`,
    payload,
    { headers: { ...authHeaders() } }
  );
  return res.data.session;
};

export const createBlobUrl = (arrayBuffer: ArrayBuffer, mimeType: string) => {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
};
