let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyBacs-f252IdAP2qfK0Tja56BPI0jyZoeM";

let user = {
    message: null,
    files: [] // Updated to hold multiple files
};

async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    let parts = [{ text: user.message }];

    // Append file data if available
    if (user.files.length > 0) {
        user.files.forEach(file => {
            parts.push({ inline_data: file });
        });
    }

    let RequestOption = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "contents": [{ "parts": parts }]
        })
    };

    try {
        let response = await fetch(Api_Url, RequestOption);
        let data = await response.json();
        let apiResponse = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        text.innerHTML = apiResponse;
    } catch (error) {
        console.log(error);
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.files = []; // Clear the files array after processing
    }
}

function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage;
    let html = `<img src="user.png" alt="" id="userImage" width="8%">
<div class="user-chat-area">
${user.message}
${user.files.map(file => `<img src="data:${file.mime_type};base64,${file.data}" class="chooseimg" />`).join('')}
</div>`;
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `<img src="ai.png" alt="" id="aiImage" width="10%">
    <div class="ai-chat-area">
    <img src="loading.webp" alt="" class="load" width="50px">
    </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

prompt.addEventListener("keydown", (e) => {
    if (e.key == "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const files = imageinput.files;
    if (!files.length) return;

    user.files = []; // Reset the files array
    Array.from(files).forEach(file => {
        let reader = new FileReader();
        reader.onload = (e) => {
            let base64string = e.target.result.split(",")[1];
            user.files.push({
                mime_type: file.type,
                data: base64string
            });
            let previewImg = document.createElement("img");
            previewImg.src = `data:${file.type};base64,${base64string}`;
            previewImg.classList.add("chooseimg");
            imagebtn.appendChild(previewImg); // Display preview for each file
        };
        reader.readAsDataURL(file);
    });
});

imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});
