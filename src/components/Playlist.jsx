import React from "react";
import { useContextAPI } from "@/context/Context";
import { dateTimeConverter } from "@/lib/dateTimeConverter";
import { useRoom } from "@liveblocks/react";

function Playlist() {
  const { state, dispatch } = useContextAPI();
  const room = useRoom();
  const videos = state.videos;

  const setCurrentVideo = (video) => {
    dispatch({ type: "SET_CURRENT_VIDEO", payload: video });
    room.broadcastEvent({ type: "SET_CURRENT_VIDEO", data: video });
  };

  return (
    <div className="flex flex-col gap-3 ml-1 overflow-auto">
      {videos.map((video) => (
        <div
          key={video.videoId}
          className="flex flex-col w-full justify-center bg-background-cyanDark cursor-pointer rounded-lg p-4 gap-3 hover:bg-background-cyanLight transition-all ease duration-200"
        >
          <div className="flex gap-3">
            <img
              src={video.thumbnailImage}
              alt={video.videoId}
              className="w-[200px] h-[100px] rounded-lg"
              onClick={() => setCurrentVideo(video)}
            />
            <div className="flex flex-col gap-2 w-full">
              <h2 title={video.title}>
                {video.title.substring(0, 60) + (video.title.length > 60 ? "..." : "")}
              </h2>
              <p className="text-text-dark text-[0.9rem]">{video.channelName}</p>
              <div className="flex w-full items-center justify-between flex-wrap relative h-[40px]">
                <p className="text-text-dark text-[0.8rem]">{dateTimeConverter(video.publishedAt)}</p>
                <button
                  className="w-fit p-2 border-[1px] rounded-lg border-gray-700 hover:bg-background text-text-dark text-[0.9rem]"
                  onClick={() => setCurrentVideo(video)}
                >
                  Play Now
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Playlist;