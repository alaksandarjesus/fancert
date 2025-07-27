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
    const response = await fetch(`/jsons/shows.json`);
    renderShows(await response.json());
  } catch (error) {
    console.error("Error fetching shows:", error);
    return;
  }
}

function renderShows(shows) {
  shows$.innerHTML = ""; // Clear existing content
  questions$.innerHTML = ""; // Clear existing content
  const cards$ = document.createElement("div");
  cards$.className = "cards-container";
    const input$ = document.createElement("input");
  input$.type = "text";
  input$.className = "search-input";
  input$.addEventListener("keyup", function () {
    const search = input$.value.trim().toLowerCase();
    Array.from(cards$.children).forEach(card => {
      const title = card.querySelector("h2").textContent.toLowerCase();
      card.style.display = title.includes(search) ? "" : "none";
    });
  });
  input$.placeholder = "Search shows...";
  shows$.appendChild(input$);
  
  // Array of light background colors
  const bgColors = [
    '#f8fafc', '#f1f5f9', '#fef9c3', '#fce7f3', '#e0f2fe', '#f0fdf4', '#f3e8ff', '#fef2f2', '#f1f7ee', '#fff7ed'
  ];
  shows.forEach((show, idx) => {
    const card = document.createElement("div");
    card.className = "card";

    // Title with colored background and less height
    const title = document.createElement("h2");
    title.textContent = show.title;
    title.style.background = bgColors[idx % bgColors.length];
    title.style.margin = "0";
    title.style.padding = "16px";
    title.style.textAlign = "center";
    title.style.minHeight = "unset";
    title.style.fontSize = "1.2rem";
    title.style.lineHeight = "1.3";
    title.style.borderRadius = "12px 12px 0 0";

    // Card body with white background
    const body = document.createElement("div");
    body.style.background = "#fff";
    body.style.borderRadius = "0 0 12px 12px";
    body.style.padding = "16px";
    body.style.margin = "0 8px 8px 8px";

    const description = document.createElement("p");
    description.textContent = show.description;
    description.style.margin = "0";

    body.appendChild(description);
    card.appendChild(title);
    card.appendChild(body);
    cards$.appendChild(card);
    hideAllInViewport();
    card.addEventListener("click", () => {
      shows$.style.display = "none";
      selectedShow = show; // Store the selected show slug
      getQuestions();
    });
  });
  shows$.style.display = "block";
  shows$.appendChild(cards$);
}

async function getQuestions() {
  const slug = selectedShow ? selectedShow.slug : null; // Default to 'friends' if no show is selected
  if (!slug) {
    return;
  }
  try {
    const response = await fetch(`/jsons/${slug}.json`);

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

  const div = document.createElement("div");
  div.className = "action-buttons";
  const backBtn = document.createElement("button");
  backBtn.textContent = "Back to Shows";
  backBtn.classList.add("back-button");
  backBtn.addEventListener("click", backToShows)
  div.appendChild(backBtn);
  // Add submit button
  const submitBtn = document.createElement("button");
  submitBtn.textContent = "Submit";
  submitBtn.type = "button";
  submitBtn.className = "submit-quiz";
  div.appendChild(submitBtn);
    questions$.appendChild(div);

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

      ctx.font = "bold 20px Inter, sans-serif";
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
    const div = document.createElement("div");
    div.style.marginTop = "32px";

  div.className = "action-buttons";
  const backBtn = document.createElement("button");
  backBtn.textContent = "Back to Shows";
  backBtn.classList.add("back-button");
  backBtn.addEventListener("click", backToShows)
  div.appendChild(backBtn);
    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download ";
    downloadBtn.className = "submit-quiz";
    div.appendChild(downloadBtn);
    certDiv.appendChild(div);
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

function backToShows() {
  hideAllInViewport();
  shows$.style.display = "grid"; // Show the shows section again
  questions$.innerHTML = ''; // Hide questions section
  certificate$.innerHTML = ''; // Hide certificate section
  selectedShow = null; // Reset selected show
}