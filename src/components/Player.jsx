import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import Youtube from "react-youtube";
import { IoSearch } from "react-icons/io5";
import { dateTimeConverter } from "@/lib/dateTimeConverter";
import toast from "react-hot-toast";
import { useContextAPI } from "@/context/Context";
import { useRoom } from "@liveblocks/react";
import {
  addToPlaylist,
  getCurrentVideoid,
  updateCurrentVideoId,
} from "@/lib/api";
import Image from "next/image";
import { MdSkipNext } from "react-icons/md";
import { MdSkipPrevious } from "react-icons/md";
import { MdPlayArrow } from "react-icons/md";
import { MdPause } from "react-icons/md";
import { IoShuffle } from "react-icons/io5";
import { ImLoop } from "react-icons/im";

function Player({ roomId }) {
  const { state, dispatch } = useContextAPI();
  const room = useRoom();
  const currentVideoId = state.currentVideo;
  const [videos, setVideos] = useState([]);
  const playerRef = useRef(null);
  const playerStateRef = useRef(-1);
  const isSeeking = useRef(false);
  const lastSyncTime = useRef(0);
  const syncInterval = 5000;
  const seekBuffer = useRef([]);
  const seekBufferTimeout = useRef(null);
  const isNewUser = useRef(true);
  const queryVideos = useRef(null);
  const playerdivRef = useRef(null);
  const playlistVideos = state.videos;
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const extractVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const query = e.target.search.value;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      let videoId = extractVideoId(query);

      let videos = [];

      if (videoId) {
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/videos",
          {
            params: {
              key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
              part: "snippet",
              id: videoId,
            },
          }
        );

        videos = response.data.items.map((item) => ({
          videoId: item.id,
          channelName: item.snippet.channelTitle,
          title: item.snippet.title,
          thumbnailImage: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishedAt,
        }));
      } else {
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
              part: "snippet",
              type: "video",
              maxResults: 30,
              q: query,
            },
          }
        );

        videos = response.data.items.map((item) => ({
          videoId: item.id.videoId,
          channelName: item.snippet.channelTitle,
          title: item.snippet.title,
          thumbnailImage: item.snippet.thumbnails.medium.url,
          publishedAt: item.snippet.publishTime,
        }));
      }

      setVideos(videos);
    } catch (error) {
      toast.error("Failed to query videos from YouTube");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleAddtoPlaylist = async (video) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const newVideo = await addToPlaylist(video, roomId);
      if (newVideo) {
        room.broadcastEvent({ type: "ADD_VIDEO_TO_PLAYLIST", data: newVideo });
        dispatch({ type: "SET_VIDEO_TO_PLAYLIST", payload: newVideo });
        toast.success("Added video to playlist!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const setCurrentVideo = async (video) => {
    await updateCurrentVideoId(video, roomId);
    dispatch({ type: "SET_CURRENT_VIDEO", payload: video.videoId });
    room.broadcastEvent({ type: "SET_CURRENT_VIDEO", data: video.videoId });
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
        setIsPlaying(newPlayerState === Youtube.PlayerState.PLAYING);
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
        if (newPlayerState === Youtube.PlayerState.ENDED && isLooping) {
          playerRef.current.playVideo();
        }
      }
      isNewUser.current = false;
    },
    [room, syncPlayback, isLooping]
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

  const fetchCurrentVideoId = async () => {
    const videoId = await getCurrentVideoid(roomId);
    dispatch({ type: "SET_CURRENT_VIDEO", payload: videoId });
    if (isNewUser.current) {
      room.broadcastEvent({ type: "VIDEO_INIT_REQUEST" });
    }
  };

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
            isSeeking.current = true;
            player.seekTo(time, true);
            setTimeout(() => (isSeeking.current = false), 1000);
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
            setIsPlaying(newState === Youtube.PlayerState.PLAYING);
            if (newState === Youtube.PlayerState.PLAYING) {
              player.playVideo();
            } else if (newState === Youtube.PlayerState.PAUSED) {
              player.pauseVideo();
            }
          }
          break;

        case "VIDEO_INIT_REQUEST":
          if (!isNewUser.current) {
            room.broadcastEvent({
              type: "VIDEO_INIT_RESPONSE",
              data: {
                time: player.getCurrentTime(),
                state: playerStateRef.current,
              },
            });
          }
          break;

        case "VIDEO_INIT_RESPONSE":
          if (isNewUser.current) {
            const { time, state } = event.data;
            player.seekTo(time, true);
            if (state === Youtube.PlayerState.PLAYING) {
              player.playVideo();
            } else {
              player.pauseVideo();
            }
            playerStateRef.current = state;
            isNewUser.current = false;
          }
          break;

        case "TOGGLE_LOOP":
          setIsLooping(event.data);
          break;

        case "TOGGLE_SHUFFLE":
          setIsShuffling(event.data);
          break;

        case "VIDEO_PLAY":
          player.playVideo();
          setIsPlaying(true);
          break;

        case "VIDEO_PAUSE":
          player.pauseVideo();
          setIsPlaying(false);
          break;

        default:
          break;
      }
    });

    return () => unsubscribe();
  }, [room]);

  useEffect(() => {
    fetchCurrentVideoId();
  }, []);

  useEffect(() => {
    queryVideos.current?.scrollIntoView({ behavior: "smooth" });
  }, [videos]);

  const savePlayer = (youtubePlayer) => {
    playerRef.current = youtubePlayer;
  };

  const handlePrevious = () => {
    const currentIndex = playlistVideos.findIndex(
      (video) => video.videoId === currentVideoId
    );
    let newIndex;
    if (isShuffling) {
      newIndex = Math.floor(Math.random() * playlistVideos.length);
    } else {
      newIndex =
        (currentIndex - 1 + playlistVideos.length) % playlistVideos.length;
    }
    setCurrentVideo(playlistVideos[newIndex]);

  };

  const handleNext = () => {
    const currentIndex = playlistVideos.findIndex(
      (video) => video.videoId === currentVideoId
    );
    let newIndex;
    if (isShuffling) {
      newIndex = Math.floor(Math.random() * playlistVideos.length);
    } else {
      newIndex = (currentIndex + 1) % playlistVideos.length;
    }
    setCurrentVideo(playlistVideos[newIndex]);
  };

  const handlePlay = () => {
    room.broadcastEvent({ type: "VIDEO_PLAY" });
    playerRef.current.playVideo();
    setIsPlaying(true);
  }

  return (
    <>
      <form
        className="flex w-full justify-between items-center border bg-black opacity-70 border-[#1e1e1e] rounded-[30px] pl-2 pr-2"
        method="post"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search for video or paste the video link.."
          className="flex w-full p-3 h-[50px] rounded-lg bg-transparent outline-none "
        />
        <button className="text-white h-[50px] w-[50px] pr-2 pl-2 rounded-lg flex items-center justify-center">
          <IoSearch color={"gray"} size={"20px"} />
        </button>
      </form>

      <div
        className="flex w-full flex-col p-3 h-full justify-between items-center border-[1px] border-[#1e1e1e] rounded-lg"
        ref={playerdivRef}
      >
        <div
          className="w-full h-full relative rounded-lg"
          style={{ paddingTop: "56%" }}
        >
          <Youtube
            videoId={currentVideoId}
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
            onEnd={handleNext}
          />
        </div>
      </div>

      <div className="flex border border-[#1e1e1e] rounded-lg justify-center gap-3 items-center p-3">
        <ImLoop
          size={"1.5rem"}
          title="Loop current video"
          className={`cursor-pointer hover:text-accent w-[50px] ${
            isLooping ? "text-accent" : ""
          }`}
          onClick={() => {
            setIsLooping(!isLooping);
            room.broadcastEvent({ type: "TOGGLE_LOOP", data: !isLooping });
          }}
        />
        <MdSkipPrevious
        title="Previous Video"
          size={"2rem"}
          className="cursor-pointer hover:text-accent w-[50px]"
          onClick={handlePrevious}
        />
        {isPlaying ? (
          <MdPause
          title="Pause Video"
            size={"2rem"}
            className="cursor-pointer hover:text-accent w-[50px]"
            onClick={() => {
              room.broadcastEvent({ type: "VIDEO_PAUSE" });

              playerRef.current.pauseVideo();
              setIsPlaying(false);
            }}
          />
        ) : (
          <MdPlayArrow
            title="Play video"
            size={"2rem"}
            className="cursor-pointer hover:text-accent w-[50px]"
            onClick={handlePlay}
          />
        )}
        <MdSkipNext
        title="Next Video"
          size={"2rem"}
          className="cursor-pointer hover:text-accent w-[50px]"
          onClick={handleNext}
        />
        <IoShuffle
          size={"2rem"}
          className={`cursor-pointer hover:text-accent w-[50px] ${
            isShuffling ? "text-accent" : ""
          }`}
          onClick={() => {
            setIsShuffling(!isShuffling);
            room.broadcastEvent({ type: "TOGGLE_SHUFFLE", data: !isShuffling });
          }}
        />
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
            className="flex flex-col w-full h-fit justify-center bg-[#0b0b0b] border border-[#1e1e1e] cursor-pointer rounded-lg p-4 gap-3 hover:bg-background-cyanLight transition-all ease duration-200"
          >
            <div className="flex gap-3 h-full flex-col md:flex-row">
              <Image
                width={128}
                height={128}
                src={video.thumbnailImage}
                alt={video.videoId}
                className="w-full h-full md:w-[200px] md:h-[100px] rounded-lg"
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
                    className="w-fit p-2 border-[1px] rounded-lg border-[#1e1e1e] text-text-dark text-[0.9rem] hover:bg-black"
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
