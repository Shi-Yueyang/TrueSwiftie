import axios from "axios";

const backendIp = import.meta.env.VITE_BACKEND_IP;

export const fetchSongWithName = async (songName: string) => {
  const response = await axios.get(`${backendIp}/ts/songs/?song_name=${songName}`);
  return response.data;
}

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

export const updateGameHistory = async (gameHistoryId: string, data: any) => {
  await axios.patch(`${backendIp}/ts/game-histories/${gameHistoryId}/`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createBlobUrl = (arrayBuffer: ArrayBuffer, mimeType: string) => {
  const blob = new Blob([arrayBuffer], { type: mimeType });
  return URL.createObjectURL(blob);
};
