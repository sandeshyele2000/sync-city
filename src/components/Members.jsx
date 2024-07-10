import React, { useEffect } from "react";

import { useOthers, useUpdateMyPresence } from "@liveblocks/react";
import { useContextAPI } from "@/context/Context";
import Image from 'next/image';

function Members({ id }) {
  const others = useOthers();
  const { state, dispatch } = useContextAPI();
  const user = state.user;

  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    updateMyPresence(user);
  }, [id]);

  return (
    <div className="messages flex flex-1 flex-col space-y-4 p-4  overflow-auto  m-2 rounded-lg bg-black bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg text-text-dark">
      <div className="flex w-full h-full overflow-auto flex-col gap-3">
        {others.map((otherUser) => (
          <div key={otherUser.id} className="flex h-[70px] w-full items-center  border-background-cyanMedium border-b-[1px]  bg-[#0b0b0b] cursor-pointer  p-5 gap-3 hover:bg-background-cyanLight transition-all ease duration-200">
              
              <Image
                width={128}
                height={128}
                key={otherUser.id}
                className="user-avatar w-9 h-9 rounded-full"
                src={otherUser.presence.profileImage}
              />
              <p>{otherUser.presence.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Members;
