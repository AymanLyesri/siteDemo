const fs = require("fs"),
  request = require("request"),
  MFA = require("mangadex-full-api"),
  imageToBase64 = require("image-to-base64");

function showManga(manga_title, offset, req, res) {
  MFA.login("aymanthebruhman", "avalid22").then(async () => {
    await MFA.Manga.search({
      title: manga_title,
      limit: 4,
      offset: offset,
    })
      .then(async (list) => {
        console.log("list found");
        if (list.length == 0) {
          res.render("show_manga/show_manga.ejs", {
            error: "No manga found!",
          });
        }

        // var download = function (uri, filename, callback) {
        //   request.head(uri, function () {
        //     request(uri).pipe(
        //       fs.createWriteStream(filename).on("close", callback)
        //     );
        //   });
        // };

        // fs.readdir("./img/", (error, filesInDirectory) => {
        //   if (error) throw error;

        //   for (let file of filesInDirectory) {
        //     console.log("File removed" + " : " + file);
        //     fs.unlinkSync("./img/" + file);
        //   }
        // });

        var bin = [],
          i = 0;

        list.forEach(async (element) => {
          await element.mainCover.resolve().then((url) => {
            imageToBase64(url.image256).then((base64) => {
              bin[i++] = base64;
              console.log(bin[i]);
            });
          });
        });

        res.render("show_manga/show_manga.ejs", {
          bin: bin,
          manga_title: manga_title,
          list: list,
          offset: offset,
          error: "",
        });
        exports.list = list;
      })
      .catch((err) => {
        console.log(err);
      });
    // if (i == list.length - 1) {
    //   download(
    //     (await list[i].mainCover.resolve()).image256,
    //     "./img/img" + (i + 1) + ".png",
    //     function () {
    //       res.render("show_manga/show_manga.ejs", {
    //         manga_title: manga_title,
    //         list: list,
    //         offset: offset,
    //         error: "",
    //       });
    //       console.log("img done");
    //     }
    //   );
    // }
    // download(
    //   (await list[i].mainCover.resolve()).image256,
    //   "./img/img" + (i + 1) + ".png",
    //   function () {
    //     console.log("img done");
    //   }
    // );
  });
}

exports.showManga = showManga;
