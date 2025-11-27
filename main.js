const TMDB_API_KEY = "eee0d7fd55c9dc0f1acae8b62e5c415d";
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZWUwZDdmZDU1YzlkYzBmMWFjYWU4YjYyZTVjNDE1ZCIsIm5iZiI6MTc2NDE4NTY2My40MDk5OTk4LCJzdWIiOiI2OTI3NTYzZmVlZGNhMjQ3MGUyNDhjMTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.kDbi9DlvGTAJdxM0iTNc5I3_l0Sa3-4xgc8C6jgtBUQ'
  }
};

// Utility: fetch JSON from TMDB
async function tmdb(path) {
  const response = await fetch('https://api.themoviedb.org/3/person/popular?language=en-US&page=1', options)
  .then(res => res.json())
  .then(res => console.log(res))
  .catch(err => console.error(err));
  return response;
}

let director = null;
let films = [];
let guessed = new Set();

// STEP 1: Start game
document.getElementById("startGame").addEventListener("click", async () => {
  document.getElementById("gameArea").style.display = "block";

  // STEP 2: Get a list of popular people
  const popular = await tmdb("/person/popular");
console.log(popular);

  // PURPOSE: TMDB doesn't have a "popular directors" endpoint,
  // so we start with general popular people and filter down.
  const directorsOnly = popular.results.filter(p =>
    p.known_for_department === "Directing"
  );
  console.log(directorsOnly);

  // STEP 3: Pick one at random
  director = directorsOnly[Math.floor(Math.random() * directorsOnly.length)];
  console.log(director);

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

