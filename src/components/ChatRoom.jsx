import { useState, useEffect, useRef } from "react";
import { useRoom } from "@liveblocks/react";
import axios from "axios";
import { IoSend } from "react-icons/io5";
import { useContextAPI } from "@/context/Context";

function LiveblocksChat({ roomId, userId }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { state, dispatch } = useContextAPI();
  const room = useRoom();
  const messageRef = useRef();

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
      await room.broadcastEvent({ type: "NEW_MESSAGE", data: savedMessage });

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

    return unsubscribe;
  }, [room, roomId]);

  useEffect(() => {
    messageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="liveblocks-chat relative">
      <div className="messages flex flex-col space-y-4 p-4 h-[520px] overflow-auto">
        {isLoading ? (
          <p>Loading messages...</p>
        ) : (
          messages.map(({ id, user, content }) => (
            <div
              key={id}
              className={`message flex gap-3 ${
                user.id == userId ? "flex-row-reverse" : ""
              }`}
            >
              <img
                src={user.profileImage}
                alt={user.username}
                className="user-avatar w-11 h-11 rounded-full"
              />
              <p className="bg-background-cyanLight p-3 rounded-lg max-w-[60%] break-words text-text-light">
                {content}
              </p>
            </div>
          ))
        )}
        <div ref={messageRef} />
      </div>
      <form
        className="flex w-full justify-between items-center rounded-lg gap-2 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          await sendMessage();
        }}
      >
        <input
          className="flex w-full p-3 h-full rounded-lg bg-transparent outline-none border-[1px]  border-background-cyanMedium "
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
          <IoSend color="white" size="20px" />
        </button>
      </form>
    </div>
  );
}

export default function ChatRoom({ roomId, userId }) {
  return (
    <div className="flex flex-col gap-3 p-3 ">
      <LiveblocksChat roomId={roomId} userId={userId} />
    </div>
  );
}
