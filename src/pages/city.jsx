import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";
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
} from "@liveblocks/react";
import { TbMessages } from "react-icons/tb";
import { MdPlaylistPlay } from "react-icons/md";
import Loader from "@/components/common/Loader";
import { IoArrowBack } from "react-icons/io5";

function RoomContent({ id }) {
  const [tab, setTab] = useState(true);
  const { state, dispatch } = useContextAPI();
  const router = useRouter();
  const user = state.user;
  const room = state.currentRoom;
  const loading = state.loading;
  const others = useOthers();
  const updateMyPresence = useUpdateMyPresence();

  const fetchRoomDetails = async (id) => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const response = await axios.get(`/api/room/getRoomById?id=${id}`);
      dispatch({ type: "SET_CURRENT_ROOM", payload: response.data.room });
      dispatch({ type: "SET_VIDEOS", payload: response.data.room.videos });
    } catch (error) {
      toast.error("Failed to fetch room details.");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoomDetails(id);
      updateMyPresence(user);
    }
  }, [id, tab]);

  return (
    <>
      <div className="bg-[#000] w-full min-h-[100vh] flex flex-col items-center relative">
        <Navbar />
        <img
          src="./logo.png"
          alt=""
          className="w-[40vw] h-[40vw] absolute z-[0] opacity-[10%] blur-[1px] top-[50%] translate-y-[-45%]"
        />
        {room ? (
          <div className="text-white w-[80vw] items-center flex h-[85vh] justify-center gap-3 mt-24">
            <div className="flex w-[70%] flex-col gap-2 overflow-y-auto  pt-1 h-full border-[#1e1e1e] border p-2 rounded-lg bg-[#0b0b0b] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg">
              <div className="flex w-full justify-between items-center pl-2">
                <div className="flex gap-3 items-center">
                  <IoArrowBack className="cursor-pointer" color="white" onClick={()=>{router.push('/dashboard')}}/>
                  <p className="text-[1.5rem]">{room.name}</p>
                </div>

                <div className="flex gap-2 flex-col m-2  p-1 rounded-lg ">
                  <div className="flex gap-2">
                    <img
                      title="You"
                      className="user-avatar w-9 h-9 rounded-full  border-black border-2 overflow-x-auto"
                      src={user.profileImage}
                    ></img>
                    {others.map((otherUser) => (
                      <img
                        key={otherUser.id}
                        className="user-avatar w-9 h-9 rounded-full"
                        src={otherUser.presence.profileImage}
                      ></img>
                    ))}
                  </div>
                </div>
              </div>
              <Player roomId={id} />
            </div>

            <div className="flex flex-col w-[30%] h-full border-[1px] overflow-hidden rounded-lg border-[#1e1e1e] bg-[#0b0b0b] bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg ">
              <div className="flex w-full border-gray-400 p-3 gap-3">
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    tab
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab(true)}
                >
                  <TbMessages />
                  <span>Chats</span>
                </div>
                <div
                  className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                    !tab
                      ? "border-accent text-accent"
                      : "border-none text-[#5f5f5f]"
                  }`}
                  onClick={() => setTab(false)}
                >
                  <MdPlaylistPlay />
                  <span>Playlist</span>
                </div>
              </div>
              {tab ? <ChatRoom roomId={id} userId={user.id} /> : <Playlist />}
            </div>
          </div>
        ) : (
          <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px]">
            <Loader size={"100px"} />
          </div>
        )}
        {loading && (
          <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px]">
            <Loader size={"100px"} />
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
  const room = state.currentRoom;
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
