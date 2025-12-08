export type GridData = {
  [key: string]: string | number | Date;
  media: string;
  title: string;
  slug: string;
}[][];

export type StoreData = {
  [key: string]: string;
  navbarLinks: string;
  title: string;
  featureMedia: string;
  aboutKey: string;
  about: string;
  clientsKey: string;
  capabilitiesKey: string;
  capabilities: string;
  capabilitiesDescription: string;
  workKey: string;
  dragKey: string;
  contactKey: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  infoKey: string;
  newsletterKey: string;
  newsletterButton: string;
  newsletterDisclaimer: string;
  copyright: string;
  contactHook1: string;
  contactHook2: string;
  contactName: string;
};
