const roomI = document.getElementById('roomName')
const broadcastB = document.getElementById('Broadcaster')
const watcherB = document.getElementById('Watcher')
const continueJB = document.getElementById('continueJ')
const continueNB = document.getElementById('continueN')
const continueI = document.getElementById('ContinueI')
const roomID = localStorage.getItem('previousROOM')

if(roomID){

    roomI.value = roomID

}
if(localStorage.getItem('role') == 'w' || localStorage.getItem('role') == 'b'){
  continueJB.style.pointerEvents = 'auto'
  continueNB.style.pointerEvents = 'auto'
}

broadcastB.addEventListener('click', (e) => {

    localStorage.setItem('role','b')
    continueJB.style.pointerEvents = 'auto'
    continueNB.style.pointerEvents = 'auto'

})


watcherB.addEventListener('click', (e) => {

    localStorage.setItem('role','w')
    continueJB.style.pointerEvents = 'auto'
    continueNB.style.pointerEvents = 'auto'

})
  
  
  
continueI.addEventListener('click', (e) => {

  if(roomI.value){
      window.location.href = `/${roomI.value}`
  } else {
      alert('Room Not Found')
  }

})
continueNB.addEventListener('click', (e) => {

  window.location.href = '/new-room'

})

const openModalButtons = document.querySelectorAll('[data-modal-target]')
const closeModalButtons = document.querySelectorAll('[data-close-button]')
const overlay = document.getElementById('overlay')

openModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = document.querySelector(button.dataset.modalTarget)
    openModal(modal)
  })
})

overlay.addEventListener('click', () => {
  const modals = document.querySelectorAll('.modal.active')
  modals.forEach(modal => {
    closeModal(modal)
  })
})

closeModalButtons.forEach(button => {
  button.addEventListener('click', () => {
    const modal = button.closest('.modal')
    closeModal(modal)
  })
})

function openModal(modal) {
  if (modal == null) return
  modal.classList.add('active')
  overlay.classList.add('active')
}

function closeModal(modal) {
  if (modal == null) return
  modal.classList.remove('active')
  overlay.classList.remove('active')
}