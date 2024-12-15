import { setupMenu } from "./menu.js";
import { setupHamburgerMenu } from "./hamburger.js";
import { setupShowtimeFields } from "./showtimes.js";
import { setupGenreFields } from "./genres.js";
import { setupProgramScroll } from "./scrollProgram.js";
import { setupDateFilter } from "./dateFilter.js";

document.addEventListener("DOMContentLoaded", () => {
  setupDateFilter();
  setupProgramScroll();
  setupMenu();
  setupHamburgerMenu();
  setupShowtimeFields();
  setupGenreFields();
});
