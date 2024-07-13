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
import Image from "next/image";

const ExplorePage = () => {
  const { state, dispatch } = useContextAPI();
  const user = state.user;
  const allRooms = state.allRooms;
  const router = useRouter();
  const [filteredRooms, setFilteredRooms] = useState([]);
  const loading = state.loading;

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
      const data = await getAllRooms();
      setFilteredRooms(data);
      dispatch({ type: "SET_ALL_ROOMS", payload: data });
    } catch (error) {
      toast.error(error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const handleSearchCities = (e) => {
    try {
      const query = e.target.value.toLowerCase();

      if (query.length === 0) {
        setFilteredRooms(allRooms);
        return;
      }

      const filtered = allRooms.filter((room) =>
        room.name.toLowerCase().includes(query)
      );

      setFilteredRooms(filtered);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return (
    <>
      <div className="bg-background-dark w-full min-h-[100vh] flex flex-col items-center relative overflow-hidden">
        <Navbar tab={"explore"} />

        <img
          src="/logo.png"
          alt=""
          className="w-[40vw] h-[40vw] absolute z-[0] opacity-[10%] blur-[1px] top-[50%] translate-y-[-45%]"
        />
        {user && (
          <div
            className={`text-white w-[90vw] items-center flex h-full flex-col justify-center gap-5 relative`}
          >
            <p className="text-text-dark text-[22px] lg:text-[30px] mt-28 text-center">
              Explore your favorite cities and start{" "}
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
              <div className="flex flex-col w-full hover:border-accent border-[1px] border-[#1e1e1e] rounded-lg p-4 h-[550px] bg-[#0b0b0b] bg-opacity-10 backdrop-filter backdrop-blur-[45px] shadow-lg">
                <div className="flex justify-between flex-col lg:flex-row">
                  <p className="text-text-dark p-3">Explore other cities</p>
                  <input
                    type="text"
                    name="citiesSearch"
                    id="roomSearch"
                    placeholder="Search City..."
                    onChange={(e) => handleSearchCities(e)}
                    className="flex  p-3 h-[50px] bg-transparent outline-none border-b-[#1e1e1e] border-b-[1px]"
                  />
                </div>
                <div className="flex flex-col gap-3 overflow-auto mt-2">
                  {filteredRooms &&
                    filteredRooms
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
            <Loader size={"80px"} />
          </div>
        )}
      </div>

      <Notification />
    </>
  );
};

export default ExplorePage;
