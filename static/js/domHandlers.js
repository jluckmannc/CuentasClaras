export function setupAddFriendHandler() {
  const addFriendButton = document.getElementById('add-friend');
  const friendsList = document.getElementById('friends-list');
  const template = document.getElementById('friend-template');
  let friendCounter = 1;

  // Función para verificar si se puede eliminar
  function handleDelete(element) {
      const totalFriends = friendsList.querySelectorAll('div[id^="friend-"]').length;
      if (totalFriends > 1) {
          element.remove();
      }
  }

  // Agregar el event listener al botón de eliminar del primer amigo
  const firstFriendDelete = document.querySelector('#friend-1 img');
  firstFriendDelete.addEventListener('click', function() {
      handleDelete(document.getElementById('friend-1'));
  });

  addFriendButton.addEventListener('click', function () {
      const clone = template.content.cloneNode(true);
      const newFriend = clone.querySelector('div');
      friendCounter++;
      newFriend.id = `friend-${friendCounter}`;
      
      const deleteIcon = newFriend.querySelector('img');
      deleteIcon.addEventListener('click', function() {
          handleDelete(newFriend);
      });
      
      friendsList.appendChild(newFriend);
  });
}

export function initializeDOMHandlers() {
    setupAddFriendHandler();
}

