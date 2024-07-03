const axios = require("axios");

const getRooms = async () => {
    let rooms = await axios.get("https://api.liveblocks.io/v2/rooms",
        {
            headers: {
                'Authorization': `Bearer sk_prod_f0Sqqpxt3cOreevWrfAsSSHNBA08oh-54zbK0_3A71Ac7MlIlcZMsXUQj1J-JxL5`,
              }
        }
    )

    return rooms.data.data;
}

const deleteRoom = async (roomId) => {
    let deletedRoom = await axios.delete(`https://api.liveblocks.io/v2/rooms/${roomId}`,
        {
          headers: {
            'Authorization': `Bearer sk_prod_f0Sqqpxt3cOreevWrfAsSSHNBA08oh-54zbK0_3A71Ac7MlIlcZMsXUQj1J-JxL5`,
          }
        }
    );

    return deletedRoom;
}

getRooms().then(async (rooms) => {
    for(let room of rooms){
        console.log("deleted", room.id)
        await deleteRoom(room.id);
    }
})