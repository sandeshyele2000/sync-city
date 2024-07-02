import { useState, useEffect, useRef } from "react";
import { useRoom, useOthers, useUpdateMyPresence } from "@liveblocks/react";
import axios from "axios";
import { IoSend } from "react-icons/io5";
import { useContextAPI } from "@/context/Context";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { TbMessages } from "react-icons/tb";
import toast from 'react-hot-toast'

function LiveblocksChat({ roomId, userId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useContextAPI();
  const user = state.user;
  const currentRoom = state.currentRoom;
  const updateMyPresence = useUpdateMyPresence();
  const others = useOthers();
  const count = others.length;
  const room = useRoom();
  const messageRef = useRef();
  const [emojiOpen, setEmojiOpen] = useState(false);

  async function fetchMessages() {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/room/messages`, {
        params: { id: roomId },
      });

      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage() {
    setEmojiOpen(false);
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: message,
      user: { id: userId },
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessage("");

    try {
      const { data: savedMessage } = await axios.post("/api/room/sendMessage", {
        message,
        roomId,
        userId,
      });

      room.broadcastEvent({ type: "NEW_MESSAGE", data: savedMessage });

      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === newMessage.id ? savedMessage : msg
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== newMessage.id)
      );
    }
  }

  useEffect(() => {
    fetchMessages();

    const unsubscribe = room.subscribe("event", ({ event }) => {
      if (event.type === "NEW_MESSAGE") {
        setMessages((prevMessages) => {
          if (!prevMessages.some((msg) => msg.id === event.data.id)) {
            return [...prevMessages, event.data];
          }
          return prevMessages;
        });
      }
    });

    updateMyPresence(user);

    return () => unsubscribe();
  }, [room, roomId, user]);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  return (
    <>
      <div className="flex gap-2 flex-col bg-[rgba(0,0,0,0.4)] m-2  p-2 rounded-lg ">
        <div className="flex gap-2">
          <img
            title="You"
            className="user-avatar w-12 h-12 rounded-full  border-[#0ff] border-2 overflow-x-auto"
            src={user.profileImage}
          ></img>
          {others.map((otherUser) => (
            <img
              key={otherUser.id}
              className="user-avatar w-12 h-12 rounded-full"
              src={otherUser.presence.profileImage}
            ></img>
          ))}
        </div>
      </div>
      <div className="messages flex flex-1 flex-col space-y-4 p-4  overflow-auto  m-2 rounded-lg bg-[#0000004f]">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map(({ id, user, content }) => (
            <div
              key={id}
              className={`message flex gap-3 ${
                user.id == userId ? "flex-row-reverse " : ""
              }`}
            >
              <img
                src={user.profileImage}
                alt={user.username}
                className="user-avatar w-11 h-11 rounded-full"
              />
              <div
                style={{ whiteSpace: "pre-wrap" }}
                className={` p-3 rounded-lg max-w-[60%] break-words text-text-light ${
                  user.id == userId ? "bg-[#023131]" : "bg-background-cyanLight"
                }`}
              >
                {content}
              </div>
            </div>
          ))
        ) : (
          <div className="flex w-full h-full items-center justify-center">
            <TbMessages className="text-background-cyanMedium" size={"4rem"} />
          </div>
        )}
        <div ref={messageRef} />
      </div>

      <form
        className="flex  justify-between m-2  rounded-lg gap-2 relative bg-[rgba(0,0,0,0.4)] p-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await sendMessage();
        }}
      >
        <div className={`absolute bottom-[4.8rem]`}>
          <EmojiPicker
            open={emojiOpen}
            theme="dark"
            width={"17rem"}
            style={{ background: "black", color: "black",  }}
            height={"25rem"}
            lazyLoadEmojis={true}
            onEmojiClick={(e) => {
              setMessage((prevMessage) => prevMessage + e.emoji);
            }}
          />
        </div>

        <div
          className="hover:color-[#0ff] cursor-pointer mt-2"
          onClick={() => setEmojiOpen(!emojiOpen)}
        >
          <BsEmojiSmileFill
            size={"2rem"}
            fontWeight={"100"}
            color="#00ffff60"
          />
        </div>

        <textarea
          className="flex w-full p-2  rounded-lg bg-transparent outline-none border-[1px]  border-gray-800 h-[45px] min-h-[45px]"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          title="send message"
          type="submit"
          className="text-white h-12 w-12 bg-background-cyanDark border-1 border-gray-700 hover:bg-background-dark p-2 rounded-lg flex items-center justify-center"
        >
          <IoSend color="#00ffff60" size="20px" />
        </button>
      </form>
    </>
  );
}

export default function ChatRoom({ roomId, userId }) {
  return <LiveblocksChat roomId={roomId} userId={userId} />;
}
