import axios from "axios";
export const registerUser = async ({
  email,
  firebaseId,
  username,
  profileImage,
}) => {
  try {
    const response = await axios.post("/api/auth/registerUser", {
      email,
      firebaseId,
      username,
      profileImage,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const createRoom = async (roomName, hostId, isPrivate) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      "/api/room/createRoom",
      {
        roomName,
        hostId,
        isPrivate,
      },
      config
    );

    return response.data.room;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const deleteRoomById = async (roomId) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return await axios.post(
      "/api/room/deleteRoom",
      {
        roomId,
      },
      config
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getAllRooms = async () => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get("/api/room/getAllRooms", config);
    return response.data.rooms;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getAllUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`/api/user/getAllUsers`, config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUserRooms = async (userId) => {
  try {
    const token = localStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `/api/room/getUserRooms?userId=${userId}`,
      config
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchRoomDetails = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`/api/room/getRoomById?id=${id}`, config);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function fetchMessages(roomId) {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(`/api/room/messages`, {
      params: { id: roomId },
      ...config,
    });

    return response;
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export const sendMessage = async (message, roomId, userId) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const { data: savedMessage } = await axios.post(
      "/api/room/sendMessage",
      {
        message,
        roomId,
        userId,
      },
      config
    );

    return savedMessage;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const addToPlaylist = async (video, roomId) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      "/api/room/addToPlaylist",
      {
        roomId,
        video,
      },
      config
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getCurrentVideoid = async (roomId) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(
      `/api/room/getCurrentVideo?id=${roomId}`,
      config
    );
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const updateCurrentVideoId = async (video, roomId) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      "/api/room/updateCurrentVideo",
      {
        id: roomId,
        videoId: video.videoId,
      },
      config
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const deleteFromPlaylist = async (video, room) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      "/api/room/deleteFromPlaylist",
      {
        room,
        video,
      },
      config
    );

    return response;
  } catch (error) {
    console.error("Error deleting video from playlist:", error);
    throw error;
  }
};

export const updateUserDetails = async (formData, email) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(
      "/api/user/updateUser",
      {
        ...formData,
        email,
      },
      config
    );

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getUser = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.get(`/api/user/getUser?id=${id}`, config);
    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
