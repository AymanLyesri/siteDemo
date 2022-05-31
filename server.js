const express = require("express");
const app = express();
const path = require("path");
const MFA = require("mangadex-full-api");

//set view engine
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use("/css", express.static("./bootstrap/css"));
app.use("/include", express.static("./views"));

//get the first page////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.get("/", (req, res) => {
  res.render("index.ejs");
});

//get the 'search_manga' page///////////////////////////////////////////////////////////////////////////////////////////////
app.get("/search_manga", (req, res) => {
  res.render("search_manga.ejs");
});
////////////////////////////////////////////////////////////////////////////////////////////
app.post("/search_manga", (req, res) => {
  var manga_title = req.body.manga_title;
  var manga_chapter = req.body.manga_chapter;

  MFA.login("aymanthebruhman", "avalid22").then(async () => {
    const list = await MFA.Manga.search({
      title: manga_title,
      limit: Infinity,
    });

    for (var i = 0; i < list.length; i++) {
      list[i].mainCover = (await list[i].mainCover.resolve()).imageSource;
    }

    res.render("show_manga.ejs", {
      list: list,
    });

    console.log(list.length, "results for", manga_title);
    console.log(
      "The first result was written by",
      (await list[0].authors[0].resolve()).name
    );
  });
});
////////////////////////////////////////////////////////////////////////////////////////////
app.post("/search_chapter", (req, res) => {
  var manga_id = req.body.manga_id;

  MFA.login("aymanthebruhman", "avalid22")
    .then(async () => {
      console.log(manga_id);
      // Get a manga:

      let manga = await MFA.Manga.get(manga_id, true);
      let cover = (await manga.mainCover.resolve()).imageSource;

      // Get the manga's chapters:
      let chapters = await manga.getFeed(
        {
          limit: 1000,
          translatedLanguage: ["en"],
        },
        true
      );
      res.render("search_chapter.ejs", {
        chapters: chapters.length,
        manga: manga,
        cover: cover,
      });

      // Get the first chapter's pages:
    })
    .catch(console.error);
});
////////////////////////////////////////////////////////////////////////////////////////////
app.post("/show_chapter", (req, res) => {
  var manga_id = req.body.manga_id;
  var manga_chapter = parseInt(req.body.manga_chapter) - 1;
  var next_chapter = parseInt(manga_chapter) + 1;

  MFA.login("aymanthebruhman", "avalid22")
    .then(async () => {
      console.log("logged in");
      // Get a manga:

      let manga = await MFA.Manga.get(manga_id);

      console.log(manga.year);

      // Get the manga's chapters:
      let chapters = await manga.getFeed(
        {
          limit: 1000,
          translatedLanguage: ["en"],
          order: { chapter: "asc" },
        },
        true
      );

      // Get the first chapter's pages:

      let pages = await chapters[manga_chapter].getReadablePages();

      res.render("show_chapter.ejs", {
        panels: pages,
        manga_title: manga.title,
        manga_chapter: manga_chapter,
        next_chapter: next_chapter,
        manga: manga,
      });
    })
    .catch(console.error);
});

//listen to port////////////////////////////////////////////////////////////////////////////////////////////
const port = process.env.PORT || 3000;
app.listen(port);
