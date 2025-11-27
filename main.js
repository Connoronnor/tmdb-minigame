const TMDB_API_KEY = "eee0d7fd55c9dc0f1acae8b62e5c415d";
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZWUwZDdmZDU1YzlkYzBmMWFjYWU4YjYyZTVjNDE1ZCIsIm5iZiI6MTc2NDE4NTY2My40MDk5OTk4LCJzdWIiOiI2OTI3NTYzZmVlZGNhMjQ3MGUyNDhjMTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.kDbi9DlvGTAJdxM0iTNc5I3_l0Sa3-4xgc8C6jgtBUQ'
  }
};

function normalizeTitle(text) {
  return text
    .toLowerCase()                 // lowercase
    .replace(/\b(the|a)\b/gi, '')  // remove articles
    .replace(/\s+/g, ' ')          // collapse multiple spaces
    .replace(/[^\w\s]/g, '')       // remove punctuation
    .trim();                       // remove leading/trailing spaces
}

async function isFeatureFilm(movie) {
  // Must have valid release date
  if (!movie.release_date || movie.release_date.length < 10) return false;

  // Fetch runtime (short films are usually < 40m)
  const details = await tmdb(`movie/${movie.id}`);
  if (!details.runtime || details.runtime < 40) return false;

  return true;
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

// Start game
document.getElementById("startGame").addEventListener("click", async () => {
  document.getElementById("gameArea").style.display = "block";

  // Generate a director from the Director pool.
  const director = DIRECTOR_POOL[Math.floor(Math.random() * DIRECTOR_POOL.length)];
  console.log(director);

  // Display name
  document.getElementById("directorName").textContent =
    `Director: ${director.name}`;


  // Get their filmography
  const credits = await tmdb(`/person/${director.id}/movie_credits`);
  console.log(credits);
  films = [];
  
  for (const f of credits.crew.filter(c => c.job === "Director")) {
    if (await isFeatureFilm(f)) {
      films.push(f);
    }
  }
  films.sort((a, b) => (a.release_date || "0") > (b.release_date || "0") ? 1 : -1);

  // Initialise score
  document.getElementById("score").textContent =
    `Films: 0/${films.length}`;

  console.log("Filmography:", films);
});

// STEP 6: Handle guesses
document.getElementById("submitGuess").addEventListener("click", () => {
  const input = document.getElementById("guessInput");
  const guess = normalizeTitle(input.value);
  input.value = "";

  if (!guess) return;

  // Match against film titles
  const match = films.find(f => normalizeTitle(f.title) === guess);

  if (match && !guessed.has(match.id)) {
    guessed.add(match.id);

    const li = document.createElement("li");
    li.textContent = `${match.title}`;

    document.getElementById("correctList").appendChild(li);
    document.getElementById("score").textContent =
      `Films: ${guessed.size}/${films.length}`;
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

