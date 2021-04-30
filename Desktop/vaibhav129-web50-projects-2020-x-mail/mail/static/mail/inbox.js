document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').onsubmit = compose;

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
    .then((got) => got.json())
    .then(rec => {
    console.log(rec);
    rec.forEach((element) => {
        if(mailbox != "sent"){
            receiver = element.sender;
        }
        else{
          receiver = element.recipients;
        }
        var item = document.createElement("div");
        item.className = `card  my-1 items`;
        item.innerHTML = `<div class="card-body" id="item-${element.id}">
        Email : ${receiver}
         time :${element.timestamp}
        <br>
      </div>`;
      document.querySelector("#emails-view").appendChild(item);
       item.addEventListener('click', () => {
               showmail(element.id,mailbox);
               read(element.id);
              console.log(read)
    })
     if (element.read == true)
      item.style.background = 'white'
      else
      item.style.background = 'gray'
        })
      })
}

function showmail(id,mailbox){
  fetch(`/emails/${id}`)
   .then((res) => res.json())
    .then((result) => {
       console.log(result);
        document.querySelector("#emails-view").innerHTML = "";
       var item = document.createElement("div");
        item.className = `card  my-1 items`;
       item.innerHTML = `<div class="card-body" style="style="white-space: pre-wrap;">
         Sender: ${result.sender}
         <br>
         Recipients: ${result.recipients}
         <br>
         Subject: ${result.subject}
         <br>
         Time: ${result.timestamp}
        <br> Body:${result.body}
        </div>`;
     document.querySelector("#emails-view").appendChild(item);
      if(mailbox === 'inbox'){
      const archive = document.createElement("button");
      archive.className = "btn btn-success";
      archive.innerHTML = "Archive"
      archive.addEventListener("click", () => {
         fetch(`/emails/${result.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
      .then( () => {
        load_mailbox('inbox')
      })
    })
      document.querySelector("#emails-view").appendChild(archive);

    }
    else if(mailbox === 'archive')
    {
       const archive = document.createElement("button");
      archive.className = "btn btn-success";
      archive.innerHTML = "Unarchive"
      archive.addEventListener("click", () => {
      fetch(`/emails/${result.id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
      .then( () => {
        load_mailbox('inbox')
      })
    })
        document.querySelector("#emails-view").appendChild(archive);
    }
    let reply = document.createElement("button");
    reply.className = "btn btn-success";
      reply.innerHTML = "Reply"
      reply.addEventListener("click", () => {
         compose_email();
       document.querySelector('#compose-recipients').value = result.sender;
       subjecti = result.subject;
       document.querySelector('#compose-subject').value = `Re:${subjecti}`;
       time = result.timestamp
       reci = result.sender
       bod = result.body
       document.querySelector('#compose-body').value = `\n On ${time} \n${reci}  \n wrote:${bod}\n`;
      })
            document.querySelector("#emails-view").appendChild(reply);
})
}
function read(id){
 fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    })
  })
}
function compose() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(recipients);
  fetch('/emails',{
     method: 'POST',
     body: JSON.stringify({
       recipients : recipients,
       subject : subject,
       body : body
     })
  })
     .then(res => res.json())
       .then(matter => {
         if("message" in matter){
           load_mailbox('sent')
         }
         if("error" in matter){
           document.querySelector('#message').innerHTML = matter['error']
         }
         console.log(matter);
        console.log("message" in matter);
        console.log("error" in matter);
       })
         .catch(error => {
             console.log(error);
          });
   return false;
}