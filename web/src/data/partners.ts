export type Partner = {
  id: string
  name: string
  image: string
  type: string
  address: string
  description: string
}

export const PARTNERS: Partner[] = [
  {
    id: "le-comptoir-du-midi",
    name: "Le Comptoir du Midi",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmon-mobilier-jardin.fr%2Fwp-content%2Fuploads%2F2025%2F01%2F5dcb1d43thumbnail.jpeg&f=1&nofb=1&ipt=d6b6ecb6a4bfb0ce216b7dd90f76867d9a618222aef7163d234b810f43ad58c2",
    type: "Restauration",
    address: "4 Cours Foch, 13400 Aubagne",
    description: "Cuisine du sud, produits frais et menu du jour.",
  },
  {
    id: "epicerie-sainte-claire",
    name: "Épicerie Sainte-Claire",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.randomripplings.com%2Fissues%2F2023%2F20230601%2F1063.jpg&f=1&nofb=1&ipt=a63337d90493169689d5f529ee9e1ea566e6b872753f7e6d5e596a901e0a1334",
    type: "Alimentation",
    address: "12 Rue Sainte-Claire, 13400 Aubagne",
    description: "Épicerie fine et produits locaux du terroir provençal.",
  },
  {
    id: "librairie-vasseur",
    name: "Librairie Vasseur",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F042%2F805%2F604%2Fnon_2x%2Fmodern-white-and-bright-cafe-with-natural-sunlight-coffee-shop-interior-design-decoration-concept-photo.jpg&f=1&nofb=1&ipt=cd9657131a9fcb81d1f3bdf2e4cc9dd31eddb29ed8f3253c861128dc29b7315a",
    type: "Culture",
    address: "8 Cours Barthélemy, 13400 Aubagne",
    description: "Librairie indépendante, romans, BD et jeunesse.",
  },
  {
    id: "pharmacie-du-parc",
    name: "Pharmacie du Parc",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fspass-sport.fr%2Fwp-content%2Fuploads%2F2024%2F04%2Fshop1.jpg&f=1&nofb=1&ipt=9528b3706c5d4394098d366585085aa52d068470780621b2351cc316dcde15c5",
    type: "Santé",
    address: "2 Avenue du Parc, 13400 Aubagne",
    description: "Pharmacie de quartier, conseils et parapharmacie.",
  },
  {
    id: "transports-regionaux-unifies",
    name: "Transports Régionaux Unifiés",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fapi.tilt-equipement.com%2Fuploads%2Fmedium_agencement_magasin_bricolage_maison_professionnel_2_4c8fb13c19.webp&f=1&nofb=1&ipt=a0c94bcc8f83591916e71038fca4f79608b350ba3a79e7d1fdc20f94d45376e2",
    type: "Mobilité",
    address: "Gare routière, 13400 Aubagne",
    description: "Abonnements et titres de transport en commun régionaux.",
  },
  {
    id: "sport-loisirs-aubagne",
    name: "Sport Loisirs Aubagne",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftheawesomedaily.com%2Fwp-content%2Fuploads%2F2016%2F09%2Fpictures-of-pizza-23-1.jpg&f=1&nofb=1&ipt=7be13bee7ecdef25760749e751b35c9f29c05251a5c7c33074be3418e0fc4b40",
    type: "Sport",
    address: "15 Avenue des Goums, 13400 Aubagne",
    description: "Équipements sportifs et articles de loisirs de plein air.",
  },
]
