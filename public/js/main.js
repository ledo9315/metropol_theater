import { setupMenu } from "./menu.js";
import { setupHamburgerMenu } from "./hamburger.js";
import { setupShowtimeFields } from "./showtimes.js";
import { setupGenreFields } from "./genres.js";
import { setupProgramScroll } from "./scrollProgram.js";
import { setupDateFilter } from "./dateFilter.js";
import { setupCarousel } from "./carousel.js";
import { setupProducerFields } from "./producers.js";
import { setupProgramAnimation } from "./programAnim.js";

document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupHamburgerMenu();
  setupShowtimeFields();
  setupGenreFields();
  setupProducerFields();
  setupCarousel();
  setupProgramScroll();
  setupDateFilter();
  setupProgramAnimation();
});
