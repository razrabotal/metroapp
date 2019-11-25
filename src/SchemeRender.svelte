<script>
  export let stationsBetween;
  export let path;

  let resultPath = [];
  let stationsPath = [];

  function getResultPath({ path = [], stationsBetween }) {
    let resultPath = [];

    for (let i = 1; i < path.length; i++) {
      const firstIndex = path[i - 1];
      const secondIndex = path[i];
      let stations = stationsBetween[firstIndex][secondIndex].slice(1);
      resultPath = resultPath.concat(stations);
    }
    resultPath.unshift(path[0]);

    return resultPath;
  }

  function calculatePath({ path = [], stationsBetween }) {
    stationsPath = [];

    if(path && path.length) {
      resultPath = getResultPath({ path, stationsBetween });

      resultPath.map(item => {
        stationsPath.push(stations.find(station => station.id == item));
      });
    }
  }

  $: calculatePath({ path, stationsBetween });

  const colors = {
    red: "#d22531",
    blue: "#2060ba",
    green: "#41a747",
    text: "#09303b",
    textDisable: "#9c98a6"
  };

  const stations = [
    {
      id: "0",
      text: `<text transform="translate(511 79)">Перемога</text>`
    },
    {
      id: "1",
      text: `<text transform="translate(510 193)">Олексiївська</text>`
    },
    {
      id: "2",
      text: `<text transform="translate(512 309)">23 Серпня</text>`
    },
    {
      id: "3",
      text: `<text transform="translate(511 423)">Ботанiчний сад</text>`
    },
    {
      id: "4",
      text: `<text transform="translate(623 563)">Наукова</text>`
    },
    {
      id: "5",
      text: `<text transform="translate(438 777)">Держпром</text>`
    },
    {
      id: "6",
      text: `<text transform="translate(978 869)">Архiтектора<tspan x="0" y="49">Бекетова</tspan></text>`
    },
    {
      id: "7",
      text: `<text transform="translate(981 1152)">Захисникiв<tspan x="0" y="49">України</tspan></text>`
    },
    {
      id: "8",
      text: `<text transform="translate(291 1298)">Метробудiвникiв</text>`
    },
    {
      id: "9",
      text: `<text transform="translate(1111 78)">Героїв праці</text>`
    },
    {
      id: "10",
      text: `<text transform="translate(1110 184)">Студентська</text>`
    },
    {
      id: "11",
      text: `<text transform="translate(1111 284)">
        Академiка
        <tspan x="0" y="49">Павлова</tspan>
      </text>`
    },
    {
      id: "12",
      text: `<text transform="translate(1110 434)">Академiка<tspan x="0" y="49">Барабашова</tspan></text>`
    },
    {
      id: "13",
      text: `<text transform="translate(1033 596)">Київська</text>`
    },
    {
      id: "14",
      text: `<text transform="translate(944 686)">Пушкiнська</text>`
    },
    {
      id: "15",
      text: `<text transform="translate(856 779)">Унiверситет</text>`
    },
    {
      id: "16",
      text: `<text
        stroke="#fff"
        stroke-linejoin="round"
        stroke-width="10"
        paint-order="stroke"
        transform="translate(609 954)">Iсторичний<tspan x="0" y="49">музей</tspan>
      </text>`
    },
    {
      id: "17",
      text: `<text transform="translate(43 703)">Холодна<tspan x="97" y="49">гора</tspan></text>`
    },
    {
      id: "18",
      text: `<text transform="translate(63 882)">Пiвденний<tspan x="88" y="49">вокзал</tspan></text>`
    },
    {
      id: "19",
      text: `<text transform="translate(116 1022)">Центральний<tspan x="177" y="49">ринок</tspan></text>`
    },
    {
      id: "20",
      text: `<text
        stroke="#fff"
        stroke-linejoin="round"
        stroke-width="10"
        paint-order="stroke"
        transform="translate(605 1071)">Майдан<tspan x="0" y="49">Конституції</tspan>
      </text>`
    },
    {
      id: "21",
      text: `<text transform="translate(198 1210)">Проспект Гагарiна</text>`
    },
    {
      id: "22",
      text: `<text transform="translate(850 1298)">Спортивна</text>`
    },
    {
      id: "23",
      text: `<text transform="translate(954 1390)">Завод iм. Малишева</text>`
    },
    {
      id: "24",
      text: `<text transform="translate(1052 1498)">Турбоатом</text>`
    },
    {
      id: "25",
      text: `<text transform="translate(1111 1629)">Палац спорту</text>`
    },
    {
      id: "26",
      text: `<text transform="translate(1111 1728)">Армiйська</text>`
    },
    {
      id: "27",
      text: `<text transform="translate(1111 1831)">Iменi<tspan x="0" y="49">Масельського</tspan></text>`
    },
    {
      id: "28",
      text: `<text transform="translate(1111 1971)">Тракторний<tspan x="0" y="49">завод</tspan></text>`
    },
    {
      id: "29",
      text: `<text transform="translate(1112 2108)">Iндустрiальна</text>`
    }
  ];
</script>

<style>
  .map {
    display: block;
    width: 700px;
    margin: 50px auto;
  }
</style>

<div>{resultPath}</div>

<div class="lol">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    class="map"
    font-family="Tahoma"
    viewBox="0 0 1501 2151">

    <defs>
      <symbol id="w">
        <path
          fill="#fff"
          d="M6.6 11.5a4.9 4.9 0 110-9.8A4.8 4.8 0 019.7 3a9.7 9.7 0 004.5
          2v3.5a9.7 9.7 0 00-3.9 1.6l-.9.6a4.8 4.8 0 01-2.8 1z" />
        <path
          d="M6.7 3.5a3 3 0 012 .7 11.5 11.5 0 003.7 2V7a11.4 11.4 0 00-3.1
          1.6l-.9.6a3 3 0 01-1.8.6 3.1 3.1 0 110-6.3m0-3.5A6.6 6.6 0 000 6.6a6.6
          6.6 0 006.6 6.7 6.5 6.5 0 003.8-1.3l.9-.6a8 8 0 014.6-1.4V3.3a8 8 0
          01-5-1.8A6.5 6.5 0 006.6 0z" />
      </symbol>
    </defs>

    <g fill={colors.red}>
      <path d="M1101 1630v-21h-42v21h42z" />
      <path d="M1101 1729v-21h-42v21h42z" />
      <path d="M1101 1849v-21h-42v21h42z" />
      <path d="M1101 1972v-21h-42v21h42z" />
      <path d="M1101 2109v-20h-42v20h42z" />
      <path d="M1045 2109v-20h42v20h-43z" />
      <path d="M1052 1506l-14-14-30 29 7 8 8 7 29-30z" />
      <path d="M953 1407l-14-14-30 29 7 8 8 7 29-30z" />
      <path d="M654 1187l15 15 29-30-7-7-7-8-30 30z" />
      <path d="M441 974l15 15 29-30-7-7-7-7-30 29z" />
      <path d="M324 857l14 14 30-29-7-8-8-7-30 30z" />
      <path d="M261 683v20h42v-20h-42z" />
      <path d="M317 683v20h-42v-20h42z" />
    </g>
    <g fill={colors.green}>
      <path d="M963 1116l14-14-29-30-8 7-7 7 30 30z" />
      <path d="M977 936l-14-15-30 30 7 7 8 7 29-29z" />
      <path d="M621 580l-14-15-30 30 7 7 7 7 30-30z" />
      <path d="M501 195v-21h-42v21h42z" />
      <path d="M501 80V59h-42v21h42z" />
      <path d="M445 80V59h42v21h-42z" />
      <path d="M501 425v-21h-42v21h42z" />
      <path d="M501 310v-21h-42v21h42z" />
    </g>
    <g fill={colors.blue}>
      <path d="M935 648l15-14-30-30-7 7-8 7 30 30z" />
      <path d="M1024 559l15-14-30-30-7 7-8 7 30 30z" />
      <path d="M1101 185v-21h-42v21h42z" />
      <path d="M1101 310v-21h-42v21h42z" />
      <path d="M1101 435v-20h-42v20h42z" />
      <path d="M1101 80V59h-42v21h42z" />
      <path d="M1045 80V59h42v21h-42z" />
    </g>

    <g fill="none" stroke-miterlimit="10" stroke-width="28">
      <g stroke={colors.green}>
        <path d="M950 1089l-219 219" />
        <path d="M950 948l28 28c31 31 30 55 0 85l-28 28" />
        <path d="M732 730l218 218" />
        <path d="M594 592l138 138" />
        <path d="M473 414v32a60 60 0 0017 42l104 104" />
        <path d="M473 300v114" />
        <path d="M473 184v116" />
        <path d="M473 68v116" />
      </g>
      <g stroke={colors.blue}>
        <path d="M1073 174V68" />
        <path d="M1073 299V174" />
        <path d="M1073 425V299" />
        <path d="M1010 534l45-46a60 60 0 0018-42v-21" />
        <path d="M923 620l87-86" />
        <path d="M811 733l112-113" />
        <path d="M561 983l250-250" />
      </g>
      <g stroke={colors.red}>
        <path d="M349 842l-42-42a60 60 0 01-18-42v-63" />
        <path d="M467 961L353 846" />
        <path d="M564 1057l-97-96" />
        <path d="M680 1173l-116-116" />
        <path d="M811 1305l-131-132" />
        <path d="M926 1419l-115-114" />
        <path d="M1026 1519l-100-100" />
        <path d="M1073 1619v-28a60 60 0 00-18-42l-29-30" />
        <path d="M1073 1718v-99" />
        <path d="M1073 1839v-121" />
        <path d="M1073 1962v-124" />
        <path d="M1073 2097v-135" />
      </g>
    </g>

    <path
      fill="none"
      stroke={colors.green}
      stroke-width="3"
      d="M747 1310l-18-18-241 241a72 72 0 00-21 51v85h-15v21h56v-21h-16v-85a47
      47 0 0114-34l46-45 12 12 15-15-12-12z" />

    <use
      width="15.9"
      height="13.3"
      transform="rotate(180 421.7 665.3) scale(4.45)"
      fill={colors.red}
      xlink:href="#w" />
    <use
      width="15.9"
      height="13.3"
      transform="rotate(-90 813.4 275.5) scale(4.45)"
      fill={colors.red}
      xlink:href="#w" />

    <use
      width="15.9"
      height="13.3"
      transform="rotate(180 421.7 383) scale(4.45)"
      fill={colors.blue}
      xlink:href="#w" />
    <use
      width="15.9"
      height="13.3"
      transform="rotate(90 -175.4 772.2) scale(4.45)"
      fill={colors.blue}
      xlink:href="#w" />

    <use
      width="15.9"
      height="13.3"
      transform="matrix(4.45 0 0 4.45 702 706.8)"
      fill={colors.green}
      xlink:href="#w" />
    <use
      width="15.9"
      height="13.3"
      transform="matrix(4.45 0 0 -4.45 702 1330.5)"
      fill={colors.green}
      xlink:href="#w" />

    <g font-size="34">
      <text fill={colors.red} transform="rotate(-90 1562.5 515.7)">
        Холодногірсько-заводська лінія
      </text>
      <text fill={colors.blue} transform="rotate(-90 700.6 -347.6)">
        Салтівська лінія
      </text>
      <text fill={colors.green} transform="rotate(-90 415.7 -32.8)">
        Олексіївська лінія
      </text>
    </g>
    <g fill={colors.text} font-size="53">

      {#if resultPath.length}
        {#each stationsPath as station, index}
          {#if station}
            <g style="opacity: {index / 100 + 0.3}">
              {@html station.text}
            </g>
          {/if}
        {/each}
      {/if}

    </g>
    <g fill={colors.textDisable} font-size="53">
      <text transform="translate(573 1556)">Державiнська</text>
      <text transform="translate(519 1690)">Одеська</text>
    </g>
  </svg>

</div>
