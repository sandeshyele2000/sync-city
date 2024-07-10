import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/common/Navbar";
import Player from "@/components/Player";
import ChatRoom from "@/components/ChatRoom";
import { useContextAPI } from "@/context/Context";
import Playlist from "@/components/Playlist";
import {
  LiveblocksProvider,
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useOthersListener,
  useRoom,
} from "@liveblocks/react";
import { TbMessages } from "react-icons/tb";
import { MdPlaylistPlay } from "react-icons/md";
import Loader from "@/components/common/Loader";
import { IoArrowBack } from "react-icons/io5";
import { fetchRoomDetails, updateRoomName } from "@/lib/api";
import Members from "@/components/Members";
import { FaEdit, FaUser } from "react-icons/fa";
import Image from "next/image";

function RoomContent({ id }) {
  const [tab, setTab] = useState("chats");
  const { state, dispatch } = useContextAPI();
  const router = useRouter();
  const user = state.user;
  const room = state.currentRoom;
  const loading = state.loading;
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();
  const [editMode, setEditMode] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [featuresVisible, setFeatureVisible] = useState(false);
  const [initialConnection, setInitialConnection] = useState(true);
  const othersCount = others.length;

  const handleRoomChange = async (e) => {
    e.preventDefault();
    try {
      let name = e.target.roomName.value;
      if (name.length == 0) return toast.error("City name cannot be empty!");
      await updateRoomName(room.id, name);
      setEditMode(false);

      toast.success("Updated city name successfully!");
    } catch (error) {
      toast.error("Error in updating city name");
    }
  };

  useEffect(() => {
    if (othersCount > 0) {
      setInitialConnection(false);
    }
  }, [othersCount]);

  useOthersListener(({ type, user }) => {
    switch (type) {
      case "enter":
        if (user.presence && user.presence.username) {
          if (!initialConnection)
            toast.success(`${user.presence.username} entered ${room.name}`);
        }
        break;
      case "leave":
        if (user.presence && user.presence.username) {
          if (!initialConnection)
            toast.success(`${user.presence.username} left ${room.name}`);
        }
        break;
    }
  });

  useEffect(() => {
    if (id) {
      const getRoomDetails = async () => {
        try {
          dispatch({ type: "SET_LOADING", payload: true });
          const response = await fetchRoomDetails(id);
          dispatch({ type: "SET_CURRENT_ROOM", payload: response.data.room });
          dispatch({ type: "SET_VIDEOS", payload: response.data.room.videos });

          setRoomName(response.data.room.name);
          updateMyPresence(user);
        } catch (error) {
          toast.error(error.message);
        } finally {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      };

      getRoomDetails();
    }
  }, [id, tab,featuresVisible]);

  return (
    <>
      <div className="bg-[#000] w-full min-h-[100vh] flex flex-col items-center relative">
        <Navbar tab={"city"} />

        <Image
          width={500}
          height={500}
          src="/logo.png"
          alt=""
          className="w-[40vw] h-[40vw] absolute z-[0] opacity-[10%] blur-[1px] top-[50%] translate-y-[-45%]"
        />
        {room ? (
          <div className="text-white w-[90vw] flex h-[90vh] items-center justify-center gap-3 mt-[5rem]">
            <div className="flex w-full lg:w-[65%] flex-col gap-2 overflow-y-auto  h-full border-[#1e1e1e] border p-2 rounded-lg bg-[#474747] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg">
              <div className="flex w-full justify-between items-center pl-2">
                <div className="flex gap-3 items-center">
                  <IoArrowBack
                    className="cursor-pointer"
                    color="white"
                    onClick={() => {
                      router.push("/home");
                    }}
                  />
                  {editMode ? (
                    <form onSubmit={(e) => handleRoomChange(e)}>
                      <input
                        type="text"
                        value={roomName}
                        id="roomName"
                        placeholder="Enter new city name..."
                        onChange={(e) => setRoomName(e.target.value)}
                        className="bg-transparent text-[18px] w-full  p-3 h-[50px] rounded-lg outline-none border-[#1e1e1e] border"
                      />
                    </form>
                  ) : (
                    <p className="text-[1.5rem]">{roomName}</p>
                  )}

                  {room.hostId == user.id && (
                    <FaEdit
                      className="cursor-pointer"
                      onClick={() => setEditMode(!editMode)}
                    />
                  )}
                </div>

                <div className="flex gap-2 flex-col m-2  p-1 rounded-lg ">
                  <div className="flex gap-2">
                    <Image
                      width={500}
                      height={500}
                      title="You"
                      className="user-avatar w-9 h-9 rounded-full  border-black border-2 overflow-x-auto"
                      src={user.profileImage}
                    />
                    {others.map((otherUser) => (
                      <Image
                        width={500}
                        height={500}
                        key={otherUser.id}
                        className="user-avatar w-9 h-9 rounded-full"
                        src={otherUser.presence.profileImage}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <Player roomId={id} />
            </div>

            <div className="flex-col hidden lg:flex w-[35%] h-full border-[1px] overflow-hidden rounded-lg border-[#1e1e1e] bg-[#474747] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg ">
              <div className="flex w-full border-gray-400 p-3 gap-3 overflow-auto">
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    tab == "chats"
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab("chats")}
                >
                  <TbMessages />
                  <span>Chats</span>
                </div>
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    tab == "playlist"
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab("playlist")}
                >
                  <MdPlaylistPlay />
                  <span>Playlist</span>
                </div>
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    tab == "members"
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab("members")}
                >
                  <FaUser />
                  <span>Citizens</span>
                </div>
              </div>
              {tab == "chats" && <ChatRoom currentRoom={room} roomId={id} userId={user.id} />}
              {tab == "playlist" && <Playlist />}
              {tab == "members" && <Members roomId={id} />}
            </div>
          </div>
        ) : (
          <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px]">
            <Loader size={"80px"} />
          </div>
        )}

        {
          <div
            className={`absolute lg:hidden w-[50px] h-[50px] rounded-full bottom-0 right-[6vw] translate-x-[50%] cursor-pointer transition-transform ease duration-300 z-[100] ${
              featuresVisible ? "rotate-180" : "rotate-0"
            }`}
            onClick={() => {
              setFeatureVisible(!featuresVisible);
            }}
          >
            <Image
              width={500}
              height={500}
              src="/logo.png"
              alt=""
              className="w-[50px] h-[50px]"
            />
          </div>
        }
        {
          <div
            className={`absolute  w-full bg-transparent h-full lg:hidden items-center justify-center flex transition-transform ease duration-300 ${
              featuresVisible
                ? "scale-1 "
                : "scale-0 translate-x-[50%] translate-y-[50%]"
            }`}
          >
            <div className="flex-col flex w-[90vw] h-[85%] translate-y-8 border-[1px] overflow-hidden rounded-lg border-[#1e1e1e] bg-black bg-opacity-50 backdrop-filter backdrop-blur-lg shadow-lg text-[0.9rem] md:text-[1rem]">
              <div className="flex w-full border-gray-400 p-3 gap-3 overflow-auto">
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    tab == "chats"
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab("chats")}
                >
                  <TbMessages size={"1.5rem"} />
                  <span className="hidden lg:flex">Chats</span>
                </div>
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    tab == "playlist"
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab("playlist")}
                >
                  <MdPlaylistPlay size={"1.6rem"} />
                  <span className="hidden lg:flex">Playlist</span>
                </div>
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    tab == "members"
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab("members")}
                >
                  <FaUser size={"1rem"} />
                  <span className="hidden lg:flex">Citizens</span>
                </div>
              </div>
              {tab == "chats" && <ChatRoom currentRoom={room} roomId={id} userId={user.id} />}
              {tab == "playlist" && <Playlist />}
              {tab == "members" && <Members roomId={id} />}
            </div>
          </div>
        }
        {loading && (
          <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px] ">
            <Loader size={"80px"} />
          </div>
        )}
      </div>
    </>
  );
}

export default function Room() {
  const router = useRouter();
  const { id } = router.query;
  const { state } = useContextAPI();
  const user = state.user;

  useEffect(() => {
    if (!user) {
      let token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
      }
    }
  });

  return (
    <>
      {user && (
        <LiveblocksProvider
          publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY}
        >
          <RoomProvider id={id}>
            <RoomContent id={id} />
          </RoomProvider>
        </LiveblocksProvider>
      )}
    </>
  );
}