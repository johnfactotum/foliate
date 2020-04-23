import { Archive } from  './libarchivejs-1.3.0/src/libarchive.js'

Archive.init({
  workerUrl: "libarchivejs/libarchivejs-1.3.0/dist/worker-bundle.js",
});

window.Archive = Archive
