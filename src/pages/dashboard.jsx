"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Navbar from "../components/common/Navbar";
import Notification from "@/components/common/Notification";
import { useContextAPI } from "../context/Context";
import { useRouter } from "next/router";
import { IoEnterOutline } from "react-icons/io5";
import Loader from "@/components/common/Loader";
import { BsShareFill } from "react-icons/bs";
import { HOST_URL, ROOM_LIMIT } from "@/lib/constants";
import { FaLock } from "react-icons/fa";
import { MdOutlinePublic } from "react-icons/md";
import { createRoom, getAllRooms, getUserRooms } from "@/lib/api";
import { checkValidUser } from "@/lib/checkValidUser";

const DashBoardPage = () => {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const rooms = state.allRooms;
  const router = useRouter();
  const [userRooms, setUserRooms] = useState([]);
  const loading = state.loading;
  const [isPrivate, setIsPrivate] = useState(true);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (userRooms.length >= ROOM_LIMIT) {
      return toast.error("Reached your build limit!");
    }
    const roomName = e.target.roomName.value;
    e.target.roomName.value = "";

    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const newRoom = await createRoom(roomName, user.id, isPrivate);
      if (newRoom) {
        setUserRooms((prev) => [...prev, newRoom]);
        toast.success("City built successfully!");
      }
    } catch (error) {
      toast.error("Error building city");
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleInvite = async (room) => {
    try {
      const roomUrl = `${HOST_URL}/city?id=${room.id}`;
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(roomUrl);
        toast.success("Code to City copied to clipboard!");
      } else {
        toast.error("Clipboard not supported!");
      }
    } catch (error) {
      toast.error("Failed to copy room URL!");
    }
  };
  const fetchData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      const userRoomsData = await getUserRooms(user.id);
      const data = await getAllRooms();
      setUserRooms(userRoomsData);
      dispatch({ type: "SET_ALL_ROOMS", payload: data });
    } catch (error) {
      toast.error(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      if (!checkValidUser()) {
        console.log("going to login");
        router.push("/login");
      }
    }
  }, [user]);

  return (
    <>
      <div className="bg-background-dark w-full min-h-[100vh] flex flex-col items-center relative overflow-hidden">
        <Navbar />
        <img
          src="./logo.png"
          alt=""
          className="w-[40vw] h-[40vw] absolute z-[0] opacity-[10%] blur-[1px] top-[50%] translate-y-[-45%]"
        />
        {user && (
          <div
            className={`text-white w-[80vw] items-center flex h-full flex-col justify-center gap-5 relative`}
          >
            <div className="flex gap-2 text-[35px] mt-32">
              <span>Welcome, </span>
              <span className="text-accent">
                {user ? user.username : "Guest"}
              </span>
            </div>

            <p className="text-text-dark text-[22px] opacity-70 text-center">
              Enter into your favorite city and start{" "}
              <span className="text-accent">Syncing!</span>{" "}
            </p>

            <form
              className="flex w-[90%] justify-between items-center border bg-black opacity-70 border-[#1e1e1e] rounded-[30px] pl-2 pr-2"
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                let roomLink = e.target.roomLink.value.trim();
                router.push(roomLink);
              }}
            >
              <input
                type="text"
                name="roomLink"
                id="roomLink"
                placeholder="Paste City Link"
                className="flex w-full p-3 h-[50px] rounded-lg bg-transparent outline-none "
              />
              <button className="text-white min-w-[120px] border-l-gray-500 border-l-[1px] pr-2 pl-2  items-center justify-center flex">
                Join via link
              </button>
            </form>

            <div className="flex w-[90%] gap-4 flex-col lg:flex-row md:flex-col sm:flex-col">
              <div className="flex flex-col w-full hover:border-accent border-[1px] border-[#1e1e1e] bg-[#000000] rounded-lg p-4 h-[500px] bg-opacity-10 backdrop-filter backdrop-blur-[45px] shadow-lg">
                <p className="text-text-dark p-3">My Cities</p>
                <div className="flex h-[80%] w-full flex-col gap-3 overflow-auto">
                  {userRooms &&
                    userRooms?.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e]  rounded-lg m-2 hover:bg-[#08262654]"
                      >
                        <div className="flex gap-2 items-center">
                          {room.isPrivate ? (
                            <FaLock
                              size={"15px"}
                              title="Make City Private"
                              className="cursor-pointer"
                              onClick={() => {
                                setIsPrivate(false);
                              }}
                            />
                          ) : (
                            <MdOutlinePublic
                              size={"15px"}
                              title="Make City Public"
                              className="cursor-pointer"
                              onClick={() => {
                                setIsPrivate(true);
                              }}
                            />
                          )}
                          <p>{room.name}</p>
                        </div>
                        <div className="flex gap-5">
                          <Link
                            href={{
                              pathname: "/city",
                              query: { id: room.id },
                            }}
                          >
                            <IoEnterOutline
                              size={"1.5rem"}
                              color="gray"
                              title="Enter City"
                            />
                          </Link>
                          <button
                            className="text-gray-700 hover:text-accent"
                            onClick={() => handleInvite(room)}
                          >
                            <BsShareFill size={"1rem"} title="Share city" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
                <form
                  method="post"
                  className="flex h-[50px] justify-between w-full items-center mt-3 border-[1px] border-[#1e1e1e] p-2 rounded-[30px]"
                  onSubmit={handleCreateRoom}
                >
                  <input
                    type="text"
                    name="roomName"
                    id="roomName"
                    placeholder="Enter City Name"
                    className="flex w-[85%] p-3 h-full rounded-lg bg-[transparent] outline-none "
                  />
                  {isPrivate ? (
                    <FaLock
                      size={"15px"}
                      title="Make City Private"
                      className="cursor-pointer m-3"
                      onClick={() => {
                        setIsPrivate(false);
                      }}
                    />
                  ) : (
                    <MdOutlinePublic
                      size={"20px"}
                      title="Make City Public"
                      className="cursor-pointer m-3"
                      onClick={() => {
                        setIsPrivate(true);
                      }}
                    />
                  )}
                  <button
                    className={` text-white h-full pr-3 pl-3 text-[15px] flex items-center gap-3   border-l-gray-500 border-l-[1px] ${
                      userRooms?.length >= ROOM_LIMIT
                        ? "text-gray-500"
                        : "hover:text-accent"
                    }`}
                  >
                    Build
                  </button>
                </form>
              </div>

              <div className="flex flex-col w-full hover:border-accent border-[1px] border-[#1e1e1e] rounded-lg p-4 h-[500px] bg-[#0b0b0b] bg-opacity-10 backdrop-filter backdrop-blur-[45px] shadow-lg">
                <p className="text-text-dark p-3">Explore other cities</p>
                <div className="flex flex-col gap-3 overflow-auto">
                  {rooms &&
                    rooms
                      .filter(
                        (room) => room.hostId != user.id && !room.isPrivate
                      )
                      .map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-3 bg-[#111] border-[1px] border-[#1e1e1e]  rounded-lg m-2 hover:bg-[#08262654]"
                        >
                          <p>{room.name}</p>
                          <div className="flex gap-4">
                            <Link
                              href={{
                                pathname: "/city",
                                query: { id: room.id },
                              }}
                            >
                              <IoEnterOutline
                                size={"1.5rem"}
                                color="gray"
                                title="Enter city"
                              />
                            </Link>

                            <button
                              className="text-gray-700 hover:text-accent"
                              onClick={() => handleInvite(room)}
                            >
                              <BsShareFill size={"1rem"} title="Share city" />
                            </button>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>
          </div>
        )}
        {loading && (
          <div className="flex w-full h-full items-center justify-center absolute backdrop-blur-[1px] translate-y-[5%]">
            <Loader size={"100px"} />
          </div>
        )}
      </div>

      <Notification />
    </>
  );
};

export default DashBoardPage;
