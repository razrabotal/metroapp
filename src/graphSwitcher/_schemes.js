const schemes = [
  {
    id: 1,
    name: "Kharkiv metro",
    graphUrl: "https://metro.kh.ua/metroapi.php?value=path",
    stationsUrl: "https://metro.kh.ua/metroapi.php?value=stations",
    schemeUrl: "https://metro.kh.ua/metroapi.php?value=scheme",
    image: "images/metro-kh.svg"
  },
  {
    id: 2,
    name: "Kyiv metro",
    graphUrl: "https://raw.githubusercontent.com/razrabotal/db-2/master/metro.kiev.json",
    stationsUrl: "https://raw.githubusercontent.com/razrabotal/db-2/master/kiev-stations.json",
    schemeUrl: "",
    image: "images/metro-kiev.svg"
  },
  {
    id: 3,
    name: "Custom metro",
    graphUrl: "https://raw.githubusercontent.com/razrabotal/db-2/master/metro-custom-graph.json",
    stationsUrl: "",
    schemeUrl: "",
    image: "images/metro-my-custom.svg"
  },
  {
    id: 4,
    name: "Other metro",
    graphUrl: null,
    stationsUrl: null,
    schemeUrl: null,
    image: "images/metro-custom.svg"
  }
]

export default schemes;
