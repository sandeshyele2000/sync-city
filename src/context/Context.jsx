import React, { createContext, useReducer, useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/initFirebase";
import axios from "axios";
import toast from "react-hot-toast";

const StateContext = createContext();

const initialState = {
  user: null,
  loading: false,
  allRooms: [],
  currentRoom: null,
  videos: [],
  currentVideo: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    case "SET_CURRENT_ROOM":
      return {
        ...state,
        currentRoom: action.payload,
      };

    case "SET_ALL_ROOMS":
      return {
        ...state,
        allRooms: action.payload,
      };
    case "SET_VIDEOS":
      return {
        ...state,
        videos: action.payload,
      };

    case "SET_VIDEO_TO_PLAYLIST":
      return {
        ...state,
        videos: [...state.videos, action.payload],
      };

    case "REMOVE_VIDEO_FROM_PLAYLIST": {
      let id = action.payload;
      let updatedVideos = [...state.videos];

      updatedVideos = updatedVideos.filter((video) => video.id != id);

      return {
        ...state,
        videos: updatedVideos,
      };
    }

    case "SET_CURRENT_VIDEO":
      return {
        ...state,
        currentVideo: action.payload,
      };

    default:
      return state;
  }
};

export const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const response = await axios.get(
            `/api/user/getUser?email=${user.email}`
          );

          dispatch({
            type: "SET_USER",
            payload: response.data.user,
          });
        }
      } catch (error) {
        toast.error(error);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useContextAPI = () => useContext(StateContext);
