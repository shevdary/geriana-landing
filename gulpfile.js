let project_folder = "build/";
let source_folder = "src";

let path = {
  build: {
    html: project_folder + "",
    css: project_folder + "css/",
    img: project_folder + "images/"
  },
  src: {
    html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
    css: [
      source_folder + "/css/*.{css, scss}",
      "!" + source_folder + "/_*.{css, scss}"
    ],
    img: source_folder + "/images/**/*.{jpg,ico,png,svg}"
  },
  watch: {
    html: source_folder + "/**/*.html",
    css: source_folder + "/css/*.{css, scss}",
    img: source_folder + "/images/**/*.{jpeg,ico,png,svg}"
  },
  clean: "./" + project_folder + "/"
};
const { src, dest } = require("gulp"),
  gulp = require("gulp"),
  browsersync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include"),
  del = require("del"),
  cleancss = require("gulp-clean-css"),
  imagemin = require("gulp-imagemin"),
  gulp_autoprefixer = require("gulp-autoprefixer"),
  scss = require("gulp-sass"),
  group_media = require("gulp-group-css-media-queries"),
  ghPages = require("gh-pages");

function browcerSync(param) {
  console.log(path.watch.html);
  browsersync.init({
    server: { baseDir: "./" + project_folder + "/" },
    port: 3000
  });
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.img], images);
}

function clean(params) {
  return del(path.clean);
}

function deploy(cb) {
  ghPages.publish(project_folder, cb);
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream());
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: "expanded"
      })
    )
    .pipe(group_media())
    .pipe(fileinclude())
    .pipe(dest(path.build.css))
    .pipe(
      gulp_autoprefixer({
        overrideBrowserlist: ["last 5 version"],
        cascade: true
      })
    )
    .pipe(browsersync.stream());
}

function images() {
  return src(path.src.img)
    .pipe(
      imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        interlaced: true,
        optimizationLevel: 3
      })
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream());
}

let build = gulp.series(clean, gulp.parallel(css, html, images));
let watch = gulp.parallel(build, watchFiles, browcerSync);

exports.deploy = deploy;
exports.images = images;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;