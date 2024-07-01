import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Youtube from "react-youtube";
import { IoSearch } from "react-icons/io5";
import { dateTimeConverter } from "@/lib/dateTimeConverter";
import toast from "react-hot-toast";
import { useContextAPI } from "@/context/Context";
import { useRoom } from "@liveblocks/react";

function Player({ roomId }) {
  const { state, dispatch } = useContextAPI();
  const room = useRoom();
  const currentVideo = state.currentVideo;
  const [videos, setVideos] = useState([]);
  const [player, setPlayer] = useState(null);
  const [playerState, setPlayerState] = useState(-1);
  const isSeeking = useRef(false);

  const syncInterval = 2000; // Sync every 2 seconds

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = e.target.search.value;

    try {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
            part: "snippet",
            type: "video",
            maxResults: 10,
            q: query,
          },
        }
      );

      const temp = response.data.items.map((item) => ({
        videoId: item.id.videoId,
        channelName: item.snippet.channelTitle,
        title: item.snippet.title,
        thumbnailImage: item.snippet.thumbnails.medium.url,
        publishedAt: item.snippet.publishTime,
      }));

      setVideos(temp);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error("Failed to fetch videos.");
    }
  };

  const addToPlaylist = async (video, roomId) => {
    try {
      const response = await axios.post("/api/room/addToPlaylist", {
        roomId,
        video,
      });
      return response.data;
    } catch (error) {
      console.error(error);
      toast.error("Failed to add video to playlist.");
    }
  };

  const handleAddtoPlaylist = async (video) => {
    const newVideo = await addToPlaylist(video, roomId);
    if (newVideo) {
      room.broadcastEvent({ type: "ADD_VIDEO_TO_PLAYLIST", data: newVideo });
      dispatch({ type: "SET_VIDEO_TO_PLAYLIST", payload: newVideo });
    }
  };


  const setCurrentVideo = (video) => {
    dispatch({ type: "SET_CURRENT_VIDEO", payload: video });
    room.broadcastEvent({ type: "SET_CURRENT_VIDEO", data: video });
  };

  const syncPlayback = useCallback(() => {
    if (player && !isSeeking.current) {
      const currentTime = player.getCurrentTime();
      room.broadcastEvent({
        type: "SYNC_PLAYBACK",
        data: { time: currentTime, state: playerState },
      });
    }
  }, [player, room, playerState]);

  useEffect(() => {
    const interval = setInterval(syncPlayback, syncInterval);
    return () => clearInterval(interval);
  }, [syncPlayback]);

  const handlePlayerStateChange = (event) => {
    const newPlayerState = event.data;
    setPlayerState(newPlayerState);
    room.broadcastEvent({ type: "PLAYER_STATE_CHANGE", data: newPlayerState });
    if (newPlayerState === 1 || newPlayerState === 2) {
      syncPlayback();
    }
  };

  const handlePlayerSeek = (event) => {
    const currentTime = event.target.getCurrentTime();
    room.broadcastEvent({ type: "PLAYER_SEEK", data: currentTime });
  };

  const handlePlay = () => {
    if (player) {
      room.broadcastEvent({ type: "PLAYER_PLAY", data: player.getCurrentTime() });
    }
  };

  const handlePause = () => {
    if (player) {
      room.broadcastEvent({ type: "PLAYER_PAUSE", data: player.getCurrentTime() });
    }
  };

  useEffect(() => {
    const unsubscribe = room.subscribe("event", ({ event }) => {
      if (event.type === "SET_CURRENT_VIDEO") {
        dispatch({ type: "SET_CURRENT_VIDEO", payload: event.data });
      } else if (event.type === "SYNC_PLAYBACK") {
        // const { time, state } = event.data;
        
        // if (state === 1 && playerState !== 1) {
        //   player?.playVideo();
        // } else if (state === 2 && playerState !== 2) {
        //   player?.pauseVideo();
        // }
      } else if (event.type === "PLAYER_SEEK") {
        const seekToTime = event.data;
        if (player && Math.abs(player.getCurrentTime() - seekToTime) > 10) {
          player?.seekTo(seekToTime, true);
        }
      } else if (event.type === "PLAYER_STATE_CHANGE") {
        const newState = event.data;
        if (player) {
          if (newState === 1) {
            player.playVideo();
          } else if (newState === 2) {
            player.pauseVideo();
          }
        }
      } else if (event.type === "PLAYER_PLAY") {
        if (player) {
          player.seekTo(event.data);
          player.playVideo();
        }
      } else if (event.type === "PLAYER_PAUSE") {
        if (player) {
          player.seekTo(event.data);
          player.pauseVideo();
        }
      }
    });

    return () => unsubscribe();
  }, [room, dispatch, player, playerState]);

  const savePlayer = (youtubePlayer) => {
    setPlayer(youtubePlayer);
  };

  return (
    <>
      <form
        className="flex w-full justify-between items-center rounded-lg gap-2"
        method="post"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search..."
          className="flex w-full p-3 h-[50px] rounded-lg bg-transparent outline-none border-[1px] border-background-cyanMedium"
        />
        <button className="text-white h-[50px] w-[50px] bg-background-cyanDark border-[1px] border-background-cyanMedium hover:bg-background-dark pr-2 pl-2 rounded-lg flex items-center justify-center">
          <IoSearch color={"white"} size={"20px"} />
        </button>
      </form>

      <div className="flex w-full flex-col p-3 h-full justify-between items-center border-[1px] border-background-cyanMedium rounded-lg">
        <div className="w-full h-full relative rounded-lg overflow-hidden" style={{ paddingTop: "56%" }}>
          <Youtube
            videoId={currentVideo ? currentVideo.videoId : "RzVvThhjAKw"}
            className="absolute top-0 left-0 w-full h-full"
            iframeClassName="w-full h-full"
            opts={{ 
              playerVars: { 
                autoplay: 1,
                enablejsapi: 1,
                origin: window.location.origin
              } 
            }}
            onStateChange={handlePlayerStateChange}
            onReady={(event) => savePlayer(event.target)}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handlePlayerSeek}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 ml-1">
        {videos.map((video) => (
          <div
            key={video.id}
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
                    className="w-fit p-2 border-[1px] rounded-lg border-background-cyanMedium hover:bg-background text-text-dark text-[0.9rem]"
                    onClick={() => handleAddtoPlaylist(video)}
                  >
                    + Add to Playlist
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

export default Player;