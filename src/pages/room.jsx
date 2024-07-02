import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/common/Navbar";
import { IoMdMenu } from "react-icons/io";
import Player from "@/components/Player";
import ChatRoom from "@/components/ChatRoom";
import { useContextAPI } from "@/context/Context";
import Playlist from "@/components/Playlist";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { TbMessages } from "react-icons/tb";
import { MdPlaylistPlay } from "react-icons/md";

export default function Room() {
  const router = useRouter();
  const { id } = router.query;
  const [tab, setTab] = useState(true);
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const room = state.currentRoom;

  const fetchRoomDetails = async (id) => {
    try {
      const response = await axios.get(`/api/room/getRoomById?id=${id}`);
      dispatch({ type: "SET_CURRENT_ROOM", payload: response.data.room });
      dispatch({ type: "SET_VIDEOS", payload: response.data.room.videos });
    } catch (error) {
      toast.error("Failed to fetch room details.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoomDetails(id);
    }
  }, [id, tab]);

  if (!user || !room) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {room && user && (
        <LiveblocksProvider
          publicApiKey={process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_API_KEY}
        >
          <RoomProvider id={id}>
            <div className="bg-background-dark w-full min-h-[100vh] flex flex-col items-center">
              <Navbar />
              <div className="text-white w-[80vw] items-center flex h-[85vh] justify-center gap-3 mt-24">
                <div className="flex w-[70%] flex-col gap-2 overflow-y-auto pr-2 pt-1 h-full border-background-cyanMedium border p-2 rounded-lg">
                  <div className="flex w-full justify-between items-center p-2">
                    <p className="text-[1.5rem]">{room.name}</p>
                    <IoMdMenu className="cursor-pointer" size={"20px"}/>
                  </div>
                  <Player roomId={id} />
                </div>
                
                 <div className="flex flex-col w-[30%] h-full border-[1px] overflow-hidden rounded-lg border-background-cyanMedium bg-background-cyanDark">
                  <div className="flex w-full border-gray-400 p-3 gap-3">
                    <div
                      className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                        tab ? "border-accent text-accent" : "border-none"
                      }`}
                      onClick={() => setTab(true)}
                    >
                      <TbMessages />
                      <span>Chats</span>
                    </div>
                    <div
                      className={`p-2 border-b-[1px] h-[40px] cursor-pointer flex  items-center gap-2 ${
                        !tab ? "border-accent text-accent" : "border-none"
                      }`}
                      onClick={() => setTab(false)}
                    >
                      <MdPlaylistPlay />
                      <span>Playlist</span>
                    </div>
                  </div>
                  {tab ? (
                    <ChatRoom roomId={id} userId={user.id} />
                  ) : (
                    <Playlist />
                  )}
                </div>
                
              </div>
            </div>
          </RoomProvider>
        </LiveblocksProvider>
      )}
    </>
  );
}
