import { gsap, ScrollTrigger } from "gsap";

declare global {
  interface Window {
    gsap: typeof gsap;
    ScrollTrigger: typeof ScrollTrigger;
  }
}

export type GridData = {
  [key: string]: string | number | Date;
  media: string;
  title: string;
  slug: string;
}[][];

export type StoreData = {
  [key: string]: string;
  siteTitleFirst: string;
  siteTitleSecond: string;
  siteDescriptionFirst: string;
  siteDescriptionSecond: string;
  aboutKey: string;
  about: string;
  specialitiesKey: string;
  specialities: string;
  specialitiesDescription: string;
  projects: string;
  ctaHook: string;
  ctaButton: string;
  ctaHeading: string;
  contactKey: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  infoKey: string;
  newsletterKey: string;
  newsletterButton: string;
  newsletterDisclaimer: string;
  copyright: string;
};
