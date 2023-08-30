const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost.3001/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
const convertDirectorObToResponse = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/movies/", async (request, response) => {
  const getMovieNameQuery = `
    SELECT
      movie_name 
    FROM
      movie;`;
  const movieNameArray = await database.all(getMovieNameQuery);
  response.send(
    movieNameArray.map((eachMovieName) => ({
      movieName: eachMovieName.movie_name,
    }))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM
    movie
    WHERE
    movie_id = ${movieId};`;
  const movie = await database.get(getMovieQuery);
  response.send(convertDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { movieName, directorId, leadActor } = request.body;
  const postMovieQuery = `
  INSERT INTO
    movie (movie_name, director_id, lead_actor)
  VALUES
    ('${movieName}', ${directorId}, '${leadActor}');`;
  await database.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, reaponse) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE
    movie
    SET
    director_id = ${directorId},
    movie_name ='${movieName}',
    lead_actor = '${leadActor}'
    WHERE
    movie_id = ${movieId};`;
  await database.run(updateMovieQuery);
  response.send("MOvie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE 
    movie_id = ${movieId};`;
  await database.run(deleteMovieQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT *
    FROM
    director;`;
  const directorArray = await database.get(getDirectorQuery);
  response.send(
    directorArray.map((eachDirector) =>
      convertDirectorObToResponse(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDicMovQuery = `
    SELECT movie_name
    FROM
    movie
    WHERE
    director_id = ${directorId};`;
  const moviesArray = await database.all(getDicMovQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});
module.exports = app;
