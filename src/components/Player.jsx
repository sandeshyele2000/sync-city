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
  const playerRef = useRef(null);
  const playerStateRef = useRef(-1);
  const isSeeking = useRef(false);
  const lastSyncTime = useRef(0);
  const syncInterval = 5000;
  const seekBuffer = useRef([]);
  const seekBufferTimeout = useRef(null);

  const queryVideos = useRef(null);
  const playerdivRef = useRef(null);

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
      toast.success("Added video to playlist!");
    }
  };

  const setCurrentVideo = (video) => {
    dispatch({ type: "SET_CURRENT_VIDEO", payload: video });
    room.broadcastEvent({ type: "SET_CURRENT_VIDEO", data: video });
    playerdivRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const syncPlayback = useCallback(() => {
    const player = playerRef.current;
    if (player && !isSeeking.current) {
      const currentTime = player.getCurrentTime();
      const now = Date.now();
      if (now - lastSyncTime.current >= syncInterval) {
        room.broadcastEvent({
          type: "SYNC_PLAYBACK",
          data: { time: currentTime, state: playerStateRef.current },
        });
        lastSyncTime.current = now;
      }
    }
  }, [room]);

  useEffect(() => {
    const interval = setInterval(syncPlayback, syncInterval);
    return () => clearInterval(interval);
  }, [syncPlayback]);

  const handlePlayerStateChange = useCallback(
    (event) => {
      const newPlayerState = event.data;
      if (newPlayerState !== playerStateRef.current) {
        playerStateRef.current = newPlayerState;
        room.broadcastEvent({
          type: "PLAYER_STATE_CHANGE",
          data: newPlayerState,
        });
        if (
          newPlayerState === Youtube.PlayerState.PLAYING ||
          newPlayerState === Youtube.PlayerState.PAUSED
        ) {
          syncPlayback();
        }
      }
    },
    [room, syncPlayback]
  );

  const handlePlayerSeek = useCallback(
    (event) => {
      const currentTime = event.target.getCurrentTime();
      seekBuffer.current.push(currentTime);

      if (seekBufferTimeout.current) {
        clearTimeout(seekBufferTimeout.current);
      }

      seekBufferTimeout.current = setTimeout(() => {
        const averageSeekTime =
          seekBuffer.current.reduce((a, b) => a + b, 0) /
          seekBuffer.current.length;
        room.broadcastEvent({ type: "PLAYER_SEEK", data: averageSeekTime });
        seekBuffer.current = [];
      }, 200);
    },
    [room]
  );

  useEffect(() => {
    const unsubscribe = room.subscribe("event", ({ event }) => {
      const player = playerRef.current;
      if (!player) return;

      switch (event.type) {
        case "SET_CURRENT_VIDEO":
          dispatch({ type: "SET_CURRENT_VIDEO", payload: event.data });
          break;

        case "SYNC_PLAYBACK":
          const { time, state } = event.data;
          if (Math.abs(player.getCurrentTime() - time) > 2) {
            // CHECK IF THERE IS ANY DELAY GREATER THAN 2 SECONDS
            isSeeking.current = true; // SET SEEKING AS TRUE
            player.seekTo(time, true); // SEEK THE PLAYER TO THE EXACT TIME
            setTimeout(() => (isSeeking.current = false), 1000); // SET IT BACK TO FALSE AFTER A DELAY
          }
          if (state !== playerStateRef.current) {
            if (state === Youtube.PlayerState.PLAYING) {
              player.playVideo();
            } else if (state === Youtube.PlayerState.PAUSED) {
              player.pauseVideo();
            }
            playerStateRef.current = state;
          }
          break;

        case "PLAYER_SEEK":
          const seekToTime = event.data;
          if (Math.abs(player.getCurrentTime() - seekToTime) > 2) {
            isSeeking.current = true;
            player.seekTo(seekToTime, true);
            setTimeout(() => (isSeeking.current = false), 1000);
          }
          break;

        case "PLAYER_STATE_CHANGE":
          const newState = event.data;
          if (newState !== playerStateRef.current) {
            playerStateRef.current = newState;
            if (newState === Youtube.PlayerState.PLAYING) {
              player.playVideo();
            } else if (newState === Youtube.PlayerState.PAUSED) {
              player.pauseVideo();
            }
          }
          break;

        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [room, dispatch]);

  useEffect(() => {
    queryVideos.current?.scrollIntoView({ behavior: "smooth" });
  }, [videos]);

  const savePlayer = (youtubePlayer) => {
    playerRef.current = youtubePlayer;
  };

  return (
    <>
      <form
        className="flex w-full justify-between items-center border-[1px] border-gray-700 rounded-lg"
        method="post"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search..."
          className="flex w-full p-3 h-[50px] rounded-lg bg-transparent outline-none "
        />
        <button className="text-white h-[50px] w-[50px] pr-2 pl-2 rounded-lg flex items-center justify-center">
          <IoSearch color={"gray"} size={"20px"} />
        </button>
      </form>

      <div
        className="flex w-full flex-col p-3 h-full justify-between items-center border-[1px] border-background-cyanMedium rounded-lg"
        ref={playerdivRef}
      >
        <div
          className="w-full h-full relative rounded-lg overflow-hidden"
          style={{ paddingTop: "56%" }}
        >
          <Youtube
            videoId={currentVideo ? currentVideo.videoId : "RzVvThhjAKw"}
            className="absolute top-0 left-0 w-full h-full"
            iframeClassName="w-full h-full"
            opts={{
              playerVars: {
                autoplay: 1,
                enablejsapi: 1,
                origin: window.location.origin,
              },
            }}
            onStateChange={handlePlayerStateChange}
            onReady={(event) => savePlayer(event.target)}
            onPlay={syncPlayback}
            onPause={syncPlayback}
            onSeek={handlePlayerSeek}
          />
        </div>
      </div>

      <div
        ref={queryVideos}
        className={`flex flex-col gap-3 ml-1 ${
          videos.length == 0 ? "hidden" : ""
        }`}
      >
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
                  {video.title.substring(0, 60) +
                    (video.title.length > 60 ? "..." : "")}
                </h2>
                <p className="text-text-dark text-[0.9rem]">
                  {video.channelName}
                </p>
                <div className="flex w-full items-center justify-between flex-wrap relative h-[40px]">
                  <p className="text-text-dark text-[0.8rem]">
                    {dateTimeConverter(video.publishedAt)}
                  </p>
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