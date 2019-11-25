const colors = {
    red: "#d22531",
    blue: "#2060ba",
    green: "#41a747",
    text: "#09303b",
    textDisable: "#9c98a6"
};

export const stations = [
    {
      id: "0",
      style: 'transform: translate(511px, 79px)',
      text: `Перемога`,
      stop: '<path d="M501 80V59h-42v21h42z" /><path d="M445 80V59h42v21h-42z" />',
      path: '<path d="M473 68v116" />',
      color: colors.green
    },
    {
      id: "1",
      style: 'transform: translate(510px, 193px)',
      text: `Олексiївська`,
      stop: '<path d="M501 195v-21h-42v21h42z" />',
      path: '<path d="M473 184v116" />',
      color: colors.green
    },
    {
      id: "2",
      style: 'transform: translate(512px, 309px)',
      text: `23 Серпня`,
      stop: '<path d="M501 310v-21h-42v21h42z" />',
      path: '<path d="M473 300v114" />',
      color: colors.green
    },
    {
      id: "3",
      style: 'transform: translate(511px, 423px)',
      text: `Ботанiчний сад`,
      stop: '<path d="M501 425v-21h-42v21h42z" />',
      path: '<path d="M473 414v32a60 60 0 0017 42l104 104" />',
      color: colors.green
    },
    {
      id: "4",
      style: 'transform: translate(623px, 563px)',
      text: `Наукова`,
      stop: '<path d="M621 580l-14-15-30 30 7 7 7 7 30-30z" />',
      path: '<path d="M594 592l138 138" />',
      color: colors.green
    },
    {
      id: "5",
      style: 'transform: translate(438px, 777px)',
      text: `Держпром`,
      stop: '<use width="15.9" height="13.3" transform="matrix(4.45 0 0 4.45 702 706.8)" xlink:href="#w" />',
      path: '<path d="M732 730l218 218" />',
      color: colors.green
    },
    {
      id: "6",
      style: 'transform: translate(978px, 869px)',
      text: `Архiтектора <tspan x="0" y="49">Бекетова</tspan>`,
      stop: '<path d="M977 936l-14-15-30 30 7 7 8 7 29-29z" />',
      path: '<path d="M950 948l28 28c31 31 30 55 0 85l-28 28" />',
      color: colors.green
    },
    {
      id: "7",
      style: 'transform: translate(981px, 1152px)',
      text: `Захисникiв <tspan x="0" y="49">України</tspan>`,
      stop: '<path d="M963 1116l14-14-29-30-8 7-7 7 30 30z" />',
      path: '<path d="M950 1089l-219 219" />',
      color: colors.green
    }, 
    {
      id: "8",
      style: 'transform: translate(291px, 1298px)',
      text: `Метробудiвникiв`,
      stop: '<use width="15.9" height="13.3" transform="matrix(4.45 0 0 -4.45 702 1330.5)" xlink:href="#w" />',
      path: '',
      color: colors.green
    },
    {
      id: "9",
      style: 'transform: translate(1111px, 78px)',
      text: `Героїв праці`,
      stop: '<path d="M1101 80V59h-42v21h42z" /><path d="M1045 80V59h42v21h-42z" />',
      path: '<path d="M1073 174V68" />',
      color: colors.blue
    },
    {
      id: "10",
      style: 'transform: translate(1110px, 184px)',
      text: `Студентська`,
      stop: '<path d="M1101 185v-21h-42v21h42z" />',
      path: '<path d="M1073 299V174" />',
      color: colors.blue
    },
    {
      id: "11",
      style: 'transform: translate(1111px, 284px)',
      text: `Академiка <tspan x="0" y="49">Павлова</tspan>`,
      stop: '<path d="M1101 310v-21h-42v21h42z" />',
      path: '<path d="M1073 425V299" />',
      color: colors.blue
    }, 
    {
      id: "12",
      style: 'transform: translate(1110px, 434px)',
      text: `Академiка <tspan x="0" y="49">Барабашова</tspan>`,
      stop: '<path d="M1101 435v-20h-42v20h42z" />',
      path: '<path d="M1010 534l45-46a60 60 0 0018-42v-21" />',
      color: colors.blue
    },
    {
      id: "13",
      style: 'transform: translate(1033px, 596px)',
      text: `Київська`,
      stop: '<path d="M1024 559l15-14-30-30-7 7-8 7 30 30z" />',
      path: '<path d="M923 620l87-86" />',
      color: colors.blue
    },
    {
      id: "14",
      style: 'transform: translate(944px, 686px)',
      text: `Пушкiнська`,
      stop: '<path d="M935 648l15-14-30-30-7 7-8 7 30 30z" />',
      path: '<path d="M811 733l112-113" />',
      color: colors.blue
    },

    {
      id: "15",
      style: "transform: translate(856px, 779px);",
      text: 'Унiверситет',
      stop: '<use width="15.9" height="13.3" transform="rotate(180 421.7 383) scale(4.45)" xlink:href="#w" />',
      path: '<path d="M561 983l250-250" />',
      color: colors.blue
    },
    {
      id: "16",
      style: "stroke: #fff; stroke-linejoin: round; stroke-width: 10px; paint-order: stroke; transform: translate(609px, 954px);", 
      text: 'Iсторичний <tspan x="0" y="49">музей</tspan>',
      stop: '<use width="15.9" height="13.3" transform="rotate(90 -175.4 772.2) scale(4.45)" xlink:href="#w" />',
      path: '',
      color: colors.blue
    },
    
    {
      id: "17",
      style: 'transform: translate(43px, 703px)',
      text: `Холодна <tspan x="97" y="49">гора</tspan>`,
      stop: '<path d="M261 683v20h42v-20h-42z" /><path d="M317 683v20h-42v-20h42z" />',
      path: '<path d="M349 842l-42-42a60 60 0 01-18-42v-63" />',
      color: colors.red
    },
    {
      id: "18",
      style: 'transform: translate(63px, 882px)',
      text: `Пiвденний <tspan x="88" y="49">вокзал</tspan>`,
      stop: '<path d="M324 857l14 14 30-29-7-8-8-7-30 30z" />',
      path: '<path d="M467 961L353 846" />',
      color: colors.red
    },
    {
      id: "19",
      style: 'transform: translate(116px, 1022px)',
      text: `Центральний <tspan x="177" y="49">ринок</tspan>`,
      stop: '<path d="M441 974l15 15 29-30-7-7-7-7-30 29z" />',
      path: '<path d="M564 1057l-97-96" />',
      color: colors.red
    },
    {
      id: "20",
      style: "stroke: #fff; stroke-linejoin: round; stroke-width: 10px; paint-order: stroke; transform: translate(605px, 1071px);", 
      text: `Майдан <tspan x="0" y="49">Конституції</tspan>`,
      stop: '<use width="15.9" height="13.3" transform="rotate(-90 813.4 275.5) scale(4.45)" xlink:href="#w" />',
      path: '',
      color: colors.red
    },

    {
      id: "21",
      style: 'transform: translate(198px, 1210px)',
      text: `Проспект Гагарiна`,
      stop: '<path d="M654 1187l15 15 29-30-7-7-7-8-30 30z" />',
      path: '<path d="M680 1173l-116-116" /> <path d="M811 1305l-131-132" />',
      color: colors.red
    },
    {
      id: "22",
      style: 'transform: translate(850px, 1298px)',
      text: `Спортивна`,
      stop: '<use width="15.9" height="13.3" transform="rotate(180 421.7 665.3) scale(4.45)" xlink:href="#w" />',
      path: '',
      color: colors.red
    },
    {
      id: "23",
      style: 'transform: translate(954px, 1390px)',
      text: `Завод iм. Малишева`,
      stop: '<path d="M953 1407l-14-14-30 29 7 8 8 7 29-30z" />',
      path: '<path d="M926 1419l-115-114" />',
      color: colors.red
    }, 
    {
      id: "24",
      style: 'transform: translate(1052px, 1498px)',
      text: `Турбоатом`,
      stop: '<path d="M1052 1506l-14-14-30 29 7 8 8 7 29-30z"></path>',
      path: '<path d="M1026 1519l-100-100" />',
      color: colors.red
    },
    {
      id: "25",
      style: 'transform: translate(1111px, 1629px)',
      text: 'Палац спорту',
      stop: '<path d="M1101 1630v-21h-42v21h42z"/>',
      path: '<path d="M1073 1619v-28a60 60 0 00-18-42l-29-30" />',
      color: colors.red
    },
    {
      id: "26",
      style: 'transform: translate(1111px, 1728px)',
      text: `Армiйська`,
      stop: '<path d="M1101 1729v-21h-42v21h42z" />',
      path: '<path d="M1073 1718v-99" />',
      color: colors.red
    },
    {
      id: "27",
      style: 'transform: translate(1111px, 1831px)',
      text: `Iменi <tspan x="0" y="49">Масельського</tspan>`,
      stop: '<path d="M1101 1849v-21h-42v21h42z" />',
      path: '<path d="M1073 1839v-121" />',
      color: colors.red
    },
    {
      id: "28",
      style: 'transform: translate(1111px, 1971px)',
      text: `Тракторний <tspan x="0" y="49">завод</tspan>`,
      stop: '<path d="M1101 1972v-21h-42v21h42z" />',
      path: '<path d="M1073 1962v-124" />',
      color: colors.red
    },
    {
      id: "29",
      style: 'transform: translate(1112px, 2108px)',
      text: `Iндустрiальна`,
      stop: '<path d="M1101 2109v-20h-42v20h42z" /><path d="M1045 2109v-20h42v20h-43z" />',
      path: '<path d="M1073 2097v-135" />',
      color: colors.red
    }
  ];