export interface SteinformatData {
  id: string;
  artNr: string;
  formatBezeichnung: string;
  material: string;
  datum: string;
  abmessungen: string;
  mundstueckNr: string;
  presskopf: string;
  sonstigeEinstellungen: string;
  pressprogramm: string;
  zahnradAbschneider: string;
  hilfsmittelFotos: string[];
  
  // Beschriftung auf dem Stein Fields
  beschriftungSchlagmann: string;
  beschriftungCE: string;
  beschriftungRO: string;
  beschriftungT: string;
  druckfestigkeit: string; // Formerly beschriftung000
  beschriftungSchicht: string;
  beschriftungSchichtzeitraum: string;
  beschriftungDatum: string;

  // Grundeinstellung Vortrieb
  vortriebOben1: string;
  vortriebOben2: string;
  vortriebOben3: string;
  vortriebUnten1: string;
  vortriebUnten2: string;
  vortriebUnten3: string;
  vortriebLinks1: string;
  vortriebLinks2: string;
  vortriebLinks3: string;
  vortriebRechts1: string;
  vortriebRechts2: string;
  vortriebRechts3: string;
  vortriebZentrum: string;
  presskopfLeiste: string;
  mundstueckFoto: string | null;
  // Presse section
  austrag: string;
  schnittlaengeNass: string;
  siebmischer: string;
  wasserSiebmischer: string;
  dampfSiebmischer: string;
  gewichtNass: string;
  mischer: string;
  wasserMischer: string;
  dampfMischer: string;
  pressendruck: string;
  presse: string;
  tonreiniger: string;
  schnecke: string;
  rostkorb: string;
  styropor: string;
  // Abschneider section
  abschneidetisch: string;
  freimatikProduktname: string;
  hubhoehe: string;
  schnittlaenge: string;
  vorschub: string;
  drehvorrichtung: string;
  anzahlSchneidedraehte: string;
  offsetDrehvorr: string;
  drahtabstand: string;
  geschwLinglBandbruecke: string;
  abziehblechNr: string;
  drahtreiniger: string;
  schablone: string;
  schabloneninfo: string;
  abfallAuswerfer: string;
  drahtdurchmesser: string;
  drahtnachzug: string;
  geschwFuerNachfBand: string;
  parameterFuerDrehteller: string;
}