const TMDB_API_KEY = "eee0d7fd55c9dc0f1acae8b62e5c415d";
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZWUwZDdmZDU1YzlkYzBmMWFjYWU4YjYyZTVjNDE1ZCIsIm5iZiI6MTc2NDE4NTY2My40MDk5OTk4LCJzdWIiOiI2OTI3NTYzZmVlZGNhMjQ3MGUyNDhjMTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.kDbi9DlvGTAJdxM0iTNc5I3_l0Sa3-4xgc8C6jgtBUQ'
  }
};

function removeArticles(text) {
  return text.replace(/\b(the|a)\b/gi, '').trim();
}

// Fixed set of directors to seed searches
const DIRECTOR_NAMES = [
  "Christopher Nolan",
  "Steven Spielberg",
  "Quentin Tarantino",
  "Hayao Miyazaki",
  "Ridley Scott",
  "Martin Scorsese",
  "James Cameron",
  "Tim Burton",
  "Taika Waititi",
  "Greta Gerwig",
  "Jordan Peele",
  "Sofia Coppola",
  "Guillermo del Toro",
  "Akira Kurosawa",
  "Ingmar Bergman",
  "Bong Joon-ho",
  "Chloé Zhao",
  "Lynne Ramsay",
  "Denis Villeneuve",
  "Pablo Larraín",
  "Wong Kar-wai",
  "Alice Rohrwacher",
  "Park Chan-wook",
  "Lars von Trier",
  "David Fincher",
  "Paul Thomas Anderson",
  "Wes Anderson",
  "Richard Linklater",
  "Pedro Almodóvar",
  "Andrea Arnold",
  "Werner Herzog",
  "Yorgos Lanthimos",
  "Kelly Reichardt",
  "Ken Loach",
  "Stanley Kubrick",
  "Hirokazu Kore-eda",
  "Jean-Luc Godard",
  "Agnès Varda",
  "Francis Ford Coppola",
  "Federico Fellini",
  "Alfred Hitchcock",
  "Claire Denis",
  "Apichatpong Weerasethakul",
  "Sergio Leone",
  "Krzysztof Kieślowski",
  "Jane Campion",
  "Hiroshi Teshigahara",
  "Lucrecia Martel"
];

// PURPOSE: Convert each name into a TMDB person ID.
// We search TMDB directly because name → ID mappings are inconsistent.
const DIRECTOR_POOL = [];

async function loadDirectorPool() {
  for (const name of DIRECTOR_NAMES) {
    const search = await tmdb(`search/person?query=${encodeURIComponent(name)}`);
    console.log(search);

    // pick the top result
    const person = search.results?.[0];
    if (person) {
      DIRECTOR_POOL.push({
        name: person.name,
        id: person.id
      });
    } else {
      console.warn("No TMDB match for:", name);
    }
  }

  console.log("DIRECTOR_POOL loaded:", DIRECTOR_POOL);
}



// Utility: fetch JSON from TMDB
async function tmdb(path) {
  const response = await fetch(`https://api.themoviedb.org/3/${path}`, options)
  .catch(err => console.error(err));
  return response.json();
}

loadDirectorPool();

let director = null;
let films = [];
let guessed = new Set();

// STEP 1: Start game
document.getElementById("startGame").addEventListener("click", async () => {
  document.getElementById("gameArea").style.display = "block";

  // STEP 2: Generate a director from the Director pool.
  const director = DIRECTOR_POOL[Math.floor(Math.random() * DIRECTOR_POOL.length)];
  console.log(director);

  // STEP 4: Display name
  document.getElementById("directorName").textContent =
    `Director: ${director.name}`;

  // STEP 5: Get their filmography
  const credits = await tmdb(`/person/${director.id}/movie_credits`);
  console.log(credits);
  films = credits.crew
    .filter(job => job.job === "Director")
    .sort((a, b) => (a.release_date || "0") > (b.release_date || "0") ? 1 : -1);

  console.log("Filmography:", films);
});

// STEP 6: Handle guesses
document.getElementById("submitGuess").addEventListener("click", () => {
  const input = document.getElementById("guessInput");
  const guess = removeArticles(input.value);
  input.value = "";

  if (!guess) return;

  // Match against film titles
  const match = films.find(f => removeArticles(f.title.toLowerCase()) === guess);

  if (match && !guessed.has(match.id)) {
    guessed.add(match.id);

    const li = document.createElement("li");
    li.textContent = `${match.title} (${match.release_date?.slice(0,4) || "????"})`;

    document.getElementById("correctList").appendChild(li);
  }
});

document.getElementById("resetGame").addEventListener("click", () => {
  // Clear data
  films = [];
  guessed.clear();
  director = null;

  // Clear UI
  document.getElementById("correctList").innerHTML = "";
  document.getElementById("directorName").textContent = "";
  document.getElementById("guessInput").value = "";

  // Hide game area again (back to start screen)
  document.getElementById("gameArea").style.display = "none";

  console.log("Game has been reset.");
});

