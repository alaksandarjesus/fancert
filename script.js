const base = "http://127.0.0.1:5500";
const shows$ = document.querySelector(".shows");
const questions$ = document.querySelector(".questions");
const certificate$ = document.querySelector(".certificate");
let selectedShow = null;
(async function () {
      hideAllInViewport();
  getShows();
})();

async function getShows() {
  try {
    const response = await fetch(`${base}/jsons/shows.json`);
    renderShows(await response.json());
  } catch (error) {
    console.error("Error fetching shows:", error);
    return;
  }
}

function renderShows(shows) {
  shows$.innerHTML = ""; // Clear existing content
  questions$.innerHTML = ""; // Clear existing content

  shows.forEach((show) => {
    const card = document.createElement("div");
    card.className = "card";
    const img = document.createElement("img");
    img.src = show.image;
    img.alt = show.title;

    const title = document.createElement("h2");
    title.textContent = show.title;

    const description = document.createElement("p");
    description.textContent = show.description;

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(description);
    shows$.appendChild(card);
      hideAllInViewport();
    shows$.style.display = "grid";
    card.addEventListener("click", () => {
      shows$.style.display = "none";
      selectedShow = show; // Store the selected show slug
      getQuestions();
    });
  });
}

async function getQuestions() {
  const slug = selectedShow ? selectedShow.slug : null; // Default to 'friends' if no show is selected
  if (!slug) {
    return;
  }
  try {
    const response = await fetch(`${base}/jsons/${slug}.json`);

    renderQuestions(await response.json());
  } catch (error) {
    console.error("Error rendering quiz:", error);
  }
}

function renderQuestions(questions) {
  questions$.innerHTML = ""; // Clear existing content

  // Shuffle and select 10 random questions
  const shuffled = questions.slice().sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 10);

  selected.forEach((question, qIdx) => {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question";

    const questionText = document.createElement("h3");
    questionText.textContent = question.question;

    const optionsList = document.createElement("ul");
    question.options.forEach((option, oIdx) => {
      const optionItem = document.createElement("li");
      const label = document.createElement("label");
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `question_${qIdx}`;
      radio.value = option;
      label.appendChild(radio);
      label.appendChild(document.createTextNode(option));
      optionItem.appendChild(label);
      optionsList.appendChild(optionItem);
    });

    questionDiv.appendChild(questionText);
    questionDiv.appendChild(optionsList);
    questions$.appendChild(questionDiv);
    hideAllInViewport();
    questions$.style.display = "block"; // Show questions section
  });

  // Add submit button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.type = "button";
  submitBtn.className = "submit-quiz";
  questions$.appendChild(submitBtn);

  // Add blur effect to background (container and shows)
  const container = document.querySelector(".container");
  const shows = document.querySelector(".shows");

  submitBtn.addEventListener("click", function () {
    // Calculate score
    let score = 0;
    selected.forEach((question, qIdx) => {
      const selectedOption = document.querySelector(
        `input[name="question_${qIdx}"]:checked`
      );
      if (selectedOption && selectedOption.value === question.correctAnswer) {
        score++;
      }
    });
    //
    // Show score (simple alert, can be improved)
    if(score < 7){
        alert(`Your score: ${score} / 10. You need at least 7 to get a certificate.`);
        return;
    }
    // Remove blur after score is shown

    // Ask for user name
    let userName = prompt("Enter your name for the certificate:");
    if (!userName) userName = "Your Name";

    hideAllInViewport();
    certificate$.style.display = "flex";

    // Show certificate with canvas
    const certDiv = document.querySelector(".certificate");
    certDiv.innerHTML = "";
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    certDiv.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const img = new window.Image();
    img.src = "images/certificate.jpg";
    img.onload = function () {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.font = "bold 36px Inter, sans-serif";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      ctx.fillText(userName, canvas.width / 2, 300);

      ctx.font = "14px Inter, sans-serif";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      const line1 = `for achieving the status of `;
      ctx.fillText(line1, canvas.width / 2, 350);

      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      const line2 = `Certified ${selectedShow.title} Fan`;
      ctx.fillText(line2, canvas.width / 2, 375);

      ctx.font = "14px Inter, sans-serif";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      const line3 = `by scoring ${score}/10 in the official fan quiz.`;
      ctx.fillText(line3, canvas.width / 2, 395);

      ctx.font = "14px Inter, sans-serif";
      ctx.fillStyle = "#222";
      ctx.textAlign = "center";
      const line4 = `In the world of trivia, you are a true genius.`;
      ctx.fillText(line4, canvas.width / 2, 415);
    };
    // Add download button below the canvas
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download Certificate";
    downloadBtn.className = "submit-quiz";
    downloadBtn.style.marginTop = "32px";
    certDiv.appendChild(downloadBtn);
    downloadBtn.addEventListener("click", function () {
      const link = document.createElement("a");
      link.download = "certificate.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  });
}


function hideAllInViewport(){
    shows$.style.display = "none";
    questions$.style.display = "none";  
    certificate$.style.display = "none";    
}