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
    document.querySelector('#archive-button').addEventListener('click', archive_email);
    document.querySelector('#reply-button').addEventListener('click', reply_email);


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
    document.querySelector('#email-single').style.display = 'none';

    // Show the mailbox name
    emailview.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    //get inbox email json
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(data => {
            //Create list of email and Show it
            let ul_element = document.createElement('ul');
            ul_element.setAttribute('class', 'list-group');

            for (let email in data) {

                let li_element = document.createElement('li');
                li_element.setAttribute('class', 'list-group-item');
                li_element.dataset.id = data[email].id;
                li_element.innerHTML = `${data[email].sender} | ${data[email].timestamp} <br> ${data[email].body}`;

                if (mailbox === "sent") {
                    li_element.dataset.type = "sent";
                } else if (mailbox === "inbox") {
                    li_element.dataset.type = "inbox";
                    if (data[email].read) {
                        li_element.setAttribute("style", "background-color:#f3f3f3");
                    }
                } else if (mailbox === "archive") {
                    li_element.dataset.type = "archive";
                    li_element.setAttribute("style", "background-color:#f3f3f3");
                }

                li_element.addEventListener('click', email_detail);
                ul_element.appendChild(li_element);
            }
            emailview.append(ul_element);
        });
}

function email_detail() {
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#email-single').style.display = 'block';
    const emaildetail = document.querySelector('#email-detail');
    emaildetail.style.display = 'block';

    let id = this.dataset.id;

    fetch(`/emails/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            read: true,
        })
    });

    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(data => {
            const archive = document.querySelector("#archive-button");
            const reply = document.querySelector("#reply-button");
            if (this.dataset.type === "sent") {
                archive.setAttribute("style", "display:none");
                reply.setAttribute("style", "display:none");
            } else {
                archive.setAttribute("style", "display:inline");
                archive.dataset.id = this.dataset.id;
                archive.dataset.type = this.dataset.type;

                reply.setAttribute("style", "display:inline");
                reply.dataset.sender = data.sender;
                reply.dataset.subject = data.subject;
                reply.dataset.date = data.timestamp;

                if (this.dataset.type === "inbox")
                    archive.setAttribute("class", "bi bi-archive mx-2");
                if (this.dataset.type === "archive")
                    archive.setAttribute("class", "bi bi-archive-fill mx-2");

            }
            emaildetail.innerHTML = `<h4 style="display: inline; margin-right: 20px;">${data.sender}</h4>`;
            emaildetail.innerHTML += `<h5>${data.subject} <small style="float: right;">${data.timestamp}</small></h5>`;
            emaildetail.innerHTML += `<p>${data.body}</p>`;
        });
}

function archive_email() {
    let state = true;
    if (this.dataset.type === "archive")
        state = false;

    const id = this.dataset.id;
    fetch(`/emails/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            archived: state,
        })
    }).then(() => load_mailbox("inbox"));

}

function reply_email() {
    document.querySelector("#email-single").style.display = 'none';
    document.querySelector("#compose-view").style.display = 'block';
    const recipients = document.querySelector("#compose-recipients");
    const subject = document.querySelector("#compose-subject");
    const body = document.querySelector("#compose-body");

    recipients.value = this.dataset.sender;
    subject.value = `Re: ${this.dataset.subject}`;
    body.value = `"On ${this.dataset.date} ${this.dataset.sender} wrote: " `;

}