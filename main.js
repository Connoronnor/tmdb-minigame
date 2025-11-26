const TMDB_API_KEY = "eee0d7fd55c9dc0f1acae8b62e5c415d";

// Utility: fetch JSON from TMDB
async function tmdb(path) {
  const url = `https://api.themoviedb.org/3${path}?api_key=${TMDB_API_KEY}`;
  const response = await fetch(url);
  return response.json();
}

let director = null;
let films = [];
let guessed = new Set();

// STEP 1: Start game
document.getElementById("startGame").addEventListener("click", async () => {
  document.getElementById("gameArea").style.display = "block";

  // STEP 2: Get a list of popular people
  const popular = await tmdb("/person/popular");

  // PURPOSE: TMDB doesn't have a "popular directors" endpoint,
  // so we start with general popular people and filter down.
  const directorsOnly = popular.results.filter(p =>
    p.known_for_department === "Directing"
  );

  // STEP 3: Pick one at random
  director = directorsOnly[Math.floor(Math.random() * directorsOnly.length)];

  // STEP 4: Display name
  document.getElementById("directorName").textContent =
    `Director: ${director.name}`;

  // STEP 5: Get their filmography
  const credits = await tmdb(`/person/${director.id}/movie_credits`);
  films = credits.crew
    .filter(job => job.job === "Director")
    .sort((a, b) => (a.release_date || "0") > (b.release_date || "0") ? 1 : -1);

  console.log("Filmography:", films);
});

// STEP 6: Handle guesses
document.getElementById("submitGuess").addEventListener("click", () => {
  const input = document.getElementById("guessInput");
  const guess = input.value.trim().toLowerCase();
  input.value = "";

  if (!guess) return;

  // Match against film titles
  const match = films.find(f => f.title.toLowerCase() === guess);

  if (match && !guessed.has(match.id)) {
    guessed.add(match.id);

    const li = document.createElement("li");
    li.textContent = `${match.title} (${match.release_date?.slice(0,4) || "????"})`;

    document.getElementById("correctList").appendChild(li);
  }
});

