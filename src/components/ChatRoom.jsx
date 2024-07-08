import { useState, useEffect, useRef } from "react";
import { useRoom } from "@liveblocks/react";
import { IoSend } from "react-icons/io5";
import { useContextAPI } from "@/context/Context";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmileFill } from "react-icons/bs";
import { TbMessages } from "react-icons/tb";
import Loader from "./common/Loader";
import { DEFAULT_PROFILE } from "@/lib/constants";
import { fetchMessages, sendMessage } from "@/lib/api";

export default function ChatRoom({ roomId, userId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { state } = useContextAPI();
  const user = state.user;
  const room = useRoom();
  const messageRef = useRef();
  const [emojiOpen, setEmojiOpen] = useState(false);

  
  

  async function handleSendMessage() {
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
      const savedMessage = await sendMessage(message,roomId,userId);

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

  const getRoomMessages = async (roomId) => {
    try {
      setIsLoading(true);
      const response = await fetchMessages(roomId);
      setMessages(response.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRoomMessages(roomId);

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

    return () => unsubscribe();
  }, [room, roomId, user]);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      <div className="messages flex flex-1 flex-col space-y-4 p-4  overflow-auto text-text-dark  m-2 rounded-lg bg-black bg-opacity-10 backdrop-filter backdrop-blur-lg shadow-lg">
        {isLoading ? (
          <div className="flex w-full h-full relative justify-center items-center">
            <Loader size={"50px"} />
          </div>
        ) : messages.length > 0 ? (
          messages.map(({ id, user, content }) => (
            <div
              key={id}
              className={`message flex gap-3 ${
                user.id == userId ? "flex-row-reverse " : ""
              }`}
            >
              <img
                src={user.profileImage || DEFAULT_PROFILE}
                alt={user.username}
                className="user-avatar w-11 h-11 rounded-full"
                gray-800
              />
              <div
                style={{ whiteSpace: "pre-wrap" }}
                className={` p-3 rounded-lg max-w-[60%] break-words text-text-light  ${
                  user.id == userId ? "bg-[#023131]" : "bg-background-cyanLight"
                }`}
              >
                <p className="pb-2 text-[#076a6a] text-bold">{user.username}</p>
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
        className="flex  justify-between m-2  rounded-lg gap-2 relative bg-black p-3"
        onSubmit={async (e) => {
          e.preventDefault();
          await handleSendMessage();
        }}
      >
        <div className={`absolute bottom-[4.7rem]`}>
          <EmojiPicker
            open={emojiOpen}
            theme="dark"
            width={"17rem"}
            style={{ background: "black", color: "black" }}
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
          className="flex w-full p-2  rounded-lg bg-black outline-none border-[1px]  border-[#1e1e1e] h-[45px] min-h-[45px] text-text-dark"
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key == "Enter" && !e.shiftKey) {
              e.preventDefault();
              await handleSendMessage();
            }
          }}
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
