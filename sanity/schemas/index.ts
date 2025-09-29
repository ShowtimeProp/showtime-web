import service from "./service";
import solution from "./solution";
import post from "./post";
import project from "./project";
import siteSettings from "./siteSettings";
import home from "./home";
import localeString from "./_localeString";
import localeText from "./_localeText";
import localeBlock from "./_localeBlock";

export const schemaTypes = [
  // Helper localized types must be registered
  localeString,
  localeText,
  localeBlock,
  // Documents
  service,
  solution,
  post,
  project,
  siteSettings,
  home
];
