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
    id: "le-petit-jardin",
    name: "Le Petit Jardin",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmon-mobilier-jardin.fr%2Fwp-content%2Fuploads%2F2025%2F01%2F5dcb1d43thumbnail.jpeg&f=1&nofb=1&ipt=d6b6ecb6a4bfb0ce216b7dd90f76867d9a618222aef7163d234b810f43ad58c2",
    type: "Restaurant",
    address: "12 Rue des Lilas, 75001 Paris",
    description: "Cuisine française traditionnelle.",
  },
  {
    id: "bistro-central",
    name: "Bistro Central",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.randomripplings.com%2Fissues%2F2023%2F20230601%2F1063.jpg&f=1&nofb=1&ipt=a63337d90493169689d5f529ee9e1ea566e6b872753f7e6d5e596a901e0a1334",
    type: "Restaurant",
    address: "25 Avenue Victor Hugo, 75008 Paris",
    description: "Bistro convivial au cœur de Paris.",
  },
  {
    id: "cafe-des-amis",
    name: "Café des Amis",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F042%2F805%2F604%2Fnon_2x%2Fmodern-white-and-bright-cafe-with-natural-sunlight-coffee-shop-interior-design-decoration-concept-photo.jpg&f=1&nofb=1&ipt=cd9657131a9fcb81d1f3bdf2e4cc9dd31eddb29ed8f3253c861128dc29b7315a",
    type: "Café",
    address: "8 Rue de la Paix, 75002 Paris",
    description: "Café chaleureux et gourmand.",
  },
  {
    id: "tricatlhon",
    name: "Tricatlhon",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fspass-sport.fr%2Fwp-content%2Fuploads%2F2024%2F04%2Fshop1.jpg&f=1&nofb=1&ipt=9528b3706c5d4394098d366585085aa52d068470780621b2351cc316dcde15c5",
    type: "Magasin de sport",
    address: "42 Rue Oberkampf, 75011 Paris",
    description: "Cuisine locale et produits frais.",
  },
  {
    id: "brikol-art",
    name: "Brikol'Art",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fapi.tilt-equipement.com%2Fuploads%2Fmedium_agencement_magasin_bricolage_maison_professionnel_2_4c8fb13c19.webp&f=1&nofb=1&ipt=a0c94bcc8f83591916e71038fca4f79608b350ba3a79e7d1fdc20f94d45376e2",
    type: "Bricolage et Art",
    address: "17 Rue Montorgueil, 75002 Paris",
    description: "Spécialités françaises maison.",
  },
  {
    id: "pizza-bella",
    name: "Pizza Bella",
    image:
      "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftheawesomedaily.com%2Fwp-content%2Fuploads%2F2016%2F09%2Fpictures-of-pizza-23-1.jpg&f=1&nofb=1&ipt=7be13bee7ecdef25760749e751b35c9f29c05251a5c7c33074be3418e0fc4b40",
    type: "Pizzeria",
    address: "31 Rue de Rivoli, 75004 Paris",
    description: "Pizzas artisanales et généreuses.",
  },
]
