document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#compose-form').onsubmit = function (e) {
        e.preventDefault();
        send_email();
    };


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

function send_email() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    if (subject.trim() && body.trim()) {
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body,
            })
        }).then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert(data.message);
                    load_mailbox('inbox');
                }
            })
            .catch(error => {
                alert(error)
            });
    } else {
        alert("please fill subject and body");
    }

}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    const emailview = document.querySelector('#emails-view');
    emailview.style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-detail').style.display = 'none';

    // Show the mailbox name
    emailview.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    //get inbox email json
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            //Create list of email and Show it
            let emaillist = '<ul class="list-group">'
            for (let email in data) {
                if (mailbox == "sent") {
                    emaillist += `<li onclick="email_detail(${data[email].id});" class="list-group-item">to: ${data[email].recipients} | <small>${data[email].timestamp}</small>
                                <br>
                                <small>${data[email].subject}</small>
                                </li>`;
                } else {
                    emaillist += `<li onclick="email_detail(${data[email].id});" class="list-group-item" style="${data[email].read ? "background-color: #f3f3f3;" : ""}">${data[email].sender} | <small>${data[email].timestamp}</small>
                                <br>
                                
                                <small>${data[email].subject}</small>
                                </li>`;
                }
            }
            emaillist += '</ul>';
            emailview.innerHTML += emaillist;
        });
}

function email_detail(id) {
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    const emaildetail = document.querySelector('#email-detail');
    emaildetail.style.display = 'block';

    fetch(`/emails/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            read: true,
        })
    });

    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            emaildetail.innerHTML = `<h4>${data.sender}</h4>`;
            emaildetail.innerHTML += `<h5>${data.subject} <small>${data.timestamp}</small></h5>`;
            emaildetail.innerHTML += `<p>${data.body}</p>`;
        });
}