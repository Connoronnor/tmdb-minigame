const TMDB_API_KEY = "eee0d7fd55c9dc0f1acae8b62e5c415d";
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJlZWUwZDdmZDU1YzlkYzBmMWFjYWU4YjYyZTVjNDE1ZCIsIm5iZiI6MTc2NDE4NTY2My40MDk5OTk4LCJzdWIiOiI2OTI3NTYzZmVlZGNhMjQ3MGUyNDhjMTEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.kDbi9DlvGTAJdxM0iTNc5I3_l0Sa3-4xgc8C6jgtBUQ'
  }
};

const DIRECTOR_POOL = [
  { id: 488,   name: "Christopher Nolan" },
  { id: 578,   name: "Steven Spielberg" },
  { id: 5655,  name: "Quentin Tarantino" },
  { id: 138,   name: "Hayao Miyazaki" },
  { id: 192,   name: "Ridley Scott" },
  { id: 524,   name: "Martin Scorsese" },
  { id: 576,   name: "James Cameron" },
  { id: 525,   name: "Tim Burton" },
  { id: 10990, name: "Taika Waititi" },
  { id: 7467,  name: "Greta Gerwig" },
  { id: 6949,  name: "Jordan Peele" },
  { id: 3090,  name: "Sofia Coppola" },
  { id: 1032,  name: "Guillermo del Toro" },
  { id: 108,   name: "Akira Kurosawa" },
  { id: 106,   name: "Ingmar Bergman" },
  { id: 1927,  name: "Bong Joon-ho" },
  { id: 137427, name: "Chloé Zhao" },
  { id: 6702,  name: "Lynne Ramsay" },
  { id: 1813,  name: "Denis Villeneuve" },
  { id: 4937,  name: "Pablo Larraín" },
  { id: 11614, name: "Kar-Wai Wong" },
  { id: 1183910, name: "Alice Rohrwacher" },
  { id: 7438,  name: "Park Chan-wook" },
  { id: 224,   name: "Lars von Trier" },
  { id: 1077,  name: "David Fincher" },
  { id: 494,   name: "Paul Thomas Anderson" },
  { id: 4762,  name: "Wes Anderson" },
  { id: 3014,  name: "Richard Linklater" },
  { id: 1370,  name: "Pedro Almodóvar" },
  { id: 18897, name: "Andrea Arnold" },
  { id: 293,   name: "Werner Herzog" },
  { id: 11423, name: "Yorgos Lanthimos" },
  { id: 13917, name: "Kelly Reichardt" },
  { id: 4566,  name: "Ken Loach" },
  { id: 567,   name: "Stanley Kubrick" },
  { id: 17444, name: "Hirokazu Kore-eda" },
  { id: 11611, name: "Jean-Luc Godard" },
  { id: 1636,  name: "Agnès Varda" },
  { id: 561,   name: "Francis Ford Coppola" },
  { id: 104,   name: "Federico Fellini" },
  { id: 51,    name: "Alfred Hitchcock" },
  { id: 19304, name: "Claire Denis" },
  { id: 9588,  name: "Andrea Arnold" },
  { id: 15865, name: "Apichatpong Weerasethakul" },
  { id: 11008, name: "Sergio Leone" },
  { id: 13224, name: "Krzysztof Kieślowski" },
  { id: 4794,  name: "Jane Campion" },
  { id: 38227, name: "Hiroshi Teshigahara" },
  { id: 27490, name: "Lucrecia Martel" }
];


// Utility: fetch JSON from TMDB
async function tmdb(path) {
  const response = await fetch(`https://api.themoviedb.org/3/${path}?language=en-US&page=1`, options)
  .catch(err => console.error(err));
  return response.json();
}

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

