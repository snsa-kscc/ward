import { gsap, ScrollTrigger } from "gsap";

declare global {
  interface Window {
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
  }
}
