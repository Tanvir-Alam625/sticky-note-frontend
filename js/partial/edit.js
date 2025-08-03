document.addEventListener('DOMContentLoaded', function() {
    const noteId = new URLSearchParams(window.location.search).get('id');
    if (!noteId) {
        Utils.showMessage('Note ID is required', 'error');
        return;
    }else{
        getNoteInfo(noteId);
    }
})



async function getNoteInfo(noteId){

}