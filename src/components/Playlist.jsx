import React, { useEffect, useRef, useState } from "react";
import { useContextAPI } from "@/context/Context";
import { dateTimeConverter } from "@/lib/dateTimeConverter";
import { useRoom } from "@liveblocks/react";
import { IoMdTrash } from "react-icons/io";
import toast from "react-hot-toast";
import axios from "axios";

function Playlist() {
  const { state, dispatch } = useContextAPI();
  const searchBar = useRef();
  const room = useRoom();
  const currentRoom = state.currentRoom;
  const videos = state.videos;
  const [filteredVideos, setFilteredVideos] = useState(videos);

  const setCurrentVideo = (video) => {
    dispatch({ type: "SET_CURRENT_VIDEO", payload: video });
    room.broadcastEvent({ type: "SET_CURRENT_VIDEO", data: video });
  };
  const deleteFromPlaylist = async (video, room) => {
    try {
      const response = await axios.post("/api/room/deleteFromPlaylist", {
        room,
        video,
      });

      if (response.data.room) {
        dispatch({ type: "SET_CURRENT_ROOM", payload: response.data.room });
        toast.success("Video deleted from playlist successfully.");
      }

      return response.data;
    } catch (error) {
      console.error("Error deleting video from playlist:", error);
      toast.error("Failed to delete video from playlist.");
    }
  };

  const handleDeleteVideo = async (video) => {
    try {
      await deleteFromPlaylist(video, currentRoom);
      dispatch({ type: "REMOVE_VIDEO_FROM_PLAYLIST", payload: video.id });
      room.broadcastEvent({
        type: "REMOVE_VIDEO_FROM_PLAYLIST",
        data: video.id,
      });
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };

  useEffect(() => {
    
    setFilteredVideos(videos)
    searchBar.current.value = ""
    const unsubscribe = room.subscribe("event", ({ event }) => {
      if (event.type === "ADD_VIDEO_TO_PLAYLIST") {
        dispatch({ type: "SET_VIDEO_TO_PLAYLIST", payload: event.data });
      } else if (event.type === "REMOVE_VIDEO_FROM_PLAYLIST") {
        dispatch({ type: "REMOVE_VIDEO_FROM_PLAYLIST", payload: event.data });
      }
    });

    return () => unsubscribe();
  }, [room, dispatch, videos]);

  const handleSearchInPlaylist = (e) => {
    let query = e.target.value;
    let temp = [...videos];
    temp = temp.filter((video) => {
      if (query.length == 0) {
        return video;
      } else if (
        query &&
        video.title.toLowerCase().includes(query.toLowerCase())
      ) {
        return video;
      }
    });

    setFilteredVideos(temp);
  };

  return (
    <>
      <input
        ref={searchBar}
        type="text"
        id="searchInPlaylist"
        onChange={(e) => handleSearchInPlaylist(e)}
        placeholder="Search in playlist..."
        className="flex  p-2 m-2 h-[50px] rounded-lg bg-transparent outline-none border-[1px] border-background-cyanMedium"
      />
      <div className="flex flex-col  ml-1 overflow-auto h-full p-1">
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className="flex flex-col w-full border-background-cyanMedium border-b-[1px] justify-center bg-background-cyanDark cursor-pointer  p-5 gap-3 hover:bg-background-cyanLight transition-all ease duration-200"
          >
            <div className="flex gap-3">
              <img
                src={video.thumbnailImage}
                alt={video.videoId}
                className="w-36 h-20 rounded-lg"
                onClick={() => setCurrentVideo(video)}
              />
              <div className="flex flex-col gap-1 w-full">
                <h2 title={video.title} className="text-sm">
                  {video.title.substring(0, 60) +
                    (video.title.length > 60 ? "..." : "")}
                </h2>
                <p className="text-text-dark text-[0.9rem] text-xs">
                  {video.channelName}
                </p>
                <div className="flex w-full items-center justify-between flex-wrap relative h-[40px]">
                  <p className="text-text-dark text-[0.8rem] text-xs">
                    {dateTimeConverter(video.publishedAt)}
                  </p>
                  <button
                    className="text-gray-700 hover:text-red-700 rounded-lg border-gray-700 border p-2"
                    onClick={() => handleDeleteVideo(video)}
                  >
                    <IoMdTrash />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Playlist;
