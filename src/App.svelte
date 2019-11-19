<script>
	import Symbols from "./Symbols.svelte"
					
	const colors = {
		red: "#d22531",
		blue: "#2060ba",
		green: "#41a747",
		text: "#09303b",
		textDisable: "#9c98a6"
	}
</script>

<style lang="scss" global>
	@import "src/styles/index.scss";

	.metromap {
		width: 700px;
		margin: 50px auto;
		display: block;
	}
</style>

<div class="lol">

<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="metromap" font-family="Tahoma, Tahoma" viewBox="0 0 1501.2 2150.6">
  
	<Symbols {colors}/>

  <g fill={colors.red}>
    <path d="M1100.8 1630.1v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1100.8 1728.9v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1100.8 1848.7v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1100.8 1972v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1100.8 2109.3v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1044.5 2109.3v-20.6h42.1v20.6h-42.1z"/>
    <path d="M1052.3 1506.2l-14.5-14.6-29.8 29.7 7.3 7.3 7.3 7.3 29.7-29.7z"/>
    <path d="M953.4 1407.2l-14.6-14.5-29.8 29.7 7.3 7.3 7.3 7.3 29.8-29.8z"/>
    <path d="M654 1187.3l14.5 14.6 29.8-29.8-7.3-7.3-7.3-7.3-29.7 29.8z"/>
    <path d="M441 974.4l14.6 14.5 29.8-29.7-7.3-7.3-7.3-7.3-29.8 29.8z"/>
    <path d="M323.5 856.8l14.5 14.6 29.8-29.8-7.3-7.3-7.3-7.3-29.7 29.8z"/>
    <path d="M260.8 682.9v20.6h42.1v-20.6h-42.1z"/>
    <path d="M317 682.9v20.6h-42.1v-20.6H317z"/>
  </g>
  <g fill={colors.green}>
    <path d="M962.7 1116l14.5-14.5-29.7-29.8-7.3 7.3-7.3 7.3 29.8 29.7z"/>
    <path d="M977.2 935.7l-14.5-14.6-29.8 29.8 7.3 7.2 7.3 7.3 29.7-29.7z"/>
    <path d="M621.3 579.5l-14.6-14.6-29.7 29.8 7.2 7.3 7.3 7.2 29.8-29.7z"/>
    <path d="M500.8 194.9v-20.6h-42.1v20.6h42.1z"/>
    <path d="M500.8 79.9V59.3h-42.1v20.6h42.1z"/>
    <path d="M444.6 79.9V59.3h42.1v20.6h-42.1z"/>
    <path d="M500.8 424.9v-20.6h-42.1v20.6h42.1z"/>
    <path d="M500.8 309.9v-20.6h-42.1v20.6h42.1z"/>
  </g>
  <g fill={colors.blue}>
    <path d="M935.1 648.1l14.6-14.5-29.7-29.8-7.3 7.3-7.3 7.3 29.7 29.7z"/>
    <path d="M1024.1 559.1l14.6-14.5-29.7-29.8-7.3 7.3-7.3 7.3 29.7 29.7z"/>
    <path d="M1100.8 185.1v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1100.8 309.9v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1100.8 435.4v-20.6h-42.1v20.6h42.1z"/>
    <path d="M1100.8 79.8V59.3h-42.1v20.5h42.1z"/>
    <path d="M1044.6 79.8V59.3h42.1v20.5h-42.1z"/>
  </g>
  <g fill="none" stroke={colors.green} stroke-miterlimit="10" stroke-width="28">
    <path d="M950.3 1088.7l-219.6 219.5"/>
    <path d="M950.3 948.4l27.7 27.7c30.9 31 30 55 0 84.9l-27.7 27.7"/>
    <path d="M731.7 729.9l218.6 218.5"/>
    <path d="M593.9 592.1l137.8 137.8"/>
    <path d="M472.7 414.2V446a60 60 0 0017.6 42.4l103.6 103.7"/>
    <path d="M472.7 299.7v114.5"/>
    <path d="M472.7 184.4v115.3"/>
    <path d="M472.7 68.3v116.1"/>
  </g>
  <g fill="none" stroke={colors.blue} stroke-miterlimit="10" stroke-width="28">
    <path d="M1072.7 173.7V68.3"/>
    <path d="M1072.7 299.3V173.7"/>
    <path d="M1072.7 424.9V299.3"/>
    <path d="M1009.8 533.8l45.3-45.4a60 60 0 0017.6-42.4v-21.1"/>
    <path d="M923.4 620.2l86.4-86.4"/>
    <path d="M811.1 732.5l112.3-112.3"/>
    <path d="M561 982.6l250.1-250.1"/>
  </g>
  <g fill="none" stroke={colors.red} stroke-miterlimit="10" stroke-width="28">
    <path d="M348.6 842.2l-42.1-42.1a60 60 0 01-17.6-42.4v-63.1"/>
    <path d="M467.2 960.8L352.7 846.3"/>
    <path d="M563.5 1057l-96.3-96.2"/>
    <path d="M679.8 1173.4L563.5 1057"/>
    <path d="M811 1304.6l-131.2-131.2"/>
    <path d="M925.8 1419.4L811 1304.6"/>
    <path d="M1025.7 1519.3l-99.9-99.9"/>
    <path d="M1072.7 1619.4V1591a60 60 0 00-17.6-42.4l-29.4-29.4"/>
    <path d="M1072.7 1718.4v-99"/>
    <path d="M1072.7 1838.5v-120.1"/>
    <path d="M1072.7 1961.8v-123.3"/>
    <path d="M1072.7 2097v-135.2"/>
  </g>
  <path fill="none" stroke={colors.green} stroke-width="3" d="M746.6 1310l-17.7-17.6-240.5 240.4a72 72 0 00-21.2 51.3v85h-15.6v20.6h56.2V1669h-15.6v-84.9a47.2 47.2 0 0114-33.6l46-46 12.2 12.1 14.5-14.6-12.2-12.2z"/>
	
  <use width="15.9" height="13.3" transform="rotate(180 421.7 665.3) scale(4.45)" xlink:href="#a"/>
  <use width="15.9" height="13.3" transform="rotate(-90 813.4 275.5) scale(4.45)" xlink:href="#a"/>
  <use width="15.9" height="13.3" transform="matrix(4.45 0 0 4.45 772.7 706.8)" xlink:href="#b"/>
  <use width="15.9" height="13.3" transform="rotate(-90 778 240.2) scale(4.45)" xlink:href="#b"/>
  <use width="15.9" height="13.3" transform="matrix(4.45 0 0 4.45 702 706.8)" xlink:href="#c"/>
  <use width="15.9" height="13.3" transform="matrix(4.45 0 0 -4.45 702 1330.5)" xlink:href="#c"/>
	
  <g font-size="34">
    <text fill={colors.red} transform="rotate(-90 1562.5 515.7)">
      Холодногірсько-заводська лінія
    </text>
    <text fill={colors.blue} font-size="36" transform="rotate(-90 700.6 -347.6)">
      Салтівська лінія
    </text>
    <text fill={colors.green} font-size="36" transform="rotate(-90 415.7 -32.8)">
      Олексіївська лінія
    </text>
  </g>
  <g fill={colors.text} font-size="53">
    <text transform="translate(62.7 881.9)">
      Пiвденний <tspan x="88.1" y="49">вокзал</tspan>
    </text>
    <text transform="translate(115.6 1021.8)">
      Центральний <tspan x="177.2" y="49">ринок</tspan>
    </text>
    <text transform="translate(855.6 778.8)">
      Унiверситет
    </text>
    <text transform="translate(437.7 777.4)">
      Держпром
    </text>
    <text stroke="#fff" stroke-linejoin="round" stroke-width="10" paint-order="stroke" transform="translate(608.6 954.3)">
      Iсторичний<tspan x="0" y="49">музей</tspan>
    </text>
    <text transform="translate(981 1152.4)">
      Захисникiв <tspan x="0" y="49">України</tspan>
    </text>
    <text transform="translate(981 1152.4)">
      Захисникiв <tspan x="0" y="49">України</tspan>
    </text>
    <text transform="translate(953.7 1390.4)">
      Завод iм. Малишева
    </text>
    <text transform="translate(1051.5 1498.2)">
      Турбоатом
    </text>
    <text transform="translate(1110.5 1629.2)">
      Палац спорту
    </text>
    <text transform="translate(1111 1728.2)">
      Армiйська
    </text>
    <text transform="translate(1110.7 1831.2)">
      Iменi <tspan x="0" y="49">Масельського</tspan>
    </text>
    <text transform="translate(1111.3 1971)">
      Тракторний<tspan x="0" y="49">завод</tspan>
    </text>
    <text transform="translate(1111.7 2108.2)">
      Iндустрiальна
    </text>
    <text transform="translate(290.7 1297.5)">
      Метробудiвникiв
    </text>
    
    <text transform="translate(850.3 1298)">
      Спортивна
    </text>
    <text transform="translate(977.6 869)">
      Архiтектора <tspan x="0" y="49">Бекетова</tspan>
    </text>
    <text transform="translate(943.7 685.5)">
      Пушкiнська
    </text>
    <text transform="translate(622.7 562.9)">
      Наукова
    </text>
    <text transform="translate(510.7 423.3)">
      Ботанiчний сад
    </text>
    <text transform="translate(511.8 308.5)">
      23 Серпня
    </text>
    <text transform="translate(510 193.2)">
      Олексiївська
    </text>
    <text transform="translate(510.5 79)">
      Перемога
    </text>
    <text transform="translate(1033 595.6)">
      Київська
    </text>
    <text transform="translate(1110.2 433.8)">
      Академiка<tspan x="0" y="49">Барабашова</tspan>
    </text>
    <text transform="translate(1111.3 284)">
      Академiка<tspan x="0" y="49">Павлова</tspan>
    </text>
    <text transform="translate(1109.5 183.8)">
      Студентська
    </text>
    <text transform="translate(1110.9 78.4)">
      Героїв праці
    </text>
    <text stroke="#fff" stroke-linejoin="round" stroke-width="10" paint-order="stroke" transform="translate(604.7 1071.4)">
      Майдан<tspan x="0" y="49">Конституції</tspan>
    </text>
    <text transform="translate(197.5 1209.6)">
      Проспект Гагарiна
    </text>
    <text transform="translate(42.8 703)">
      Холодна<tspan x="97.1" y="49">гора</tspan>
    </text>
  </g>

	<g fill={colors.textDisable} font-size="53">
		<text transform="translate(573.1 1555.8)">
      Державiнська
    </text>
    <text transform="translate(519.1 1689.8)">
      Одеська
    </text>
	</g>
</svg>

<!-- <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 488.2 467.9" class="metromap">
  <Symbols {colors}/>

    <g fill="none" stroke-miterlimit="10" stroke-width="5" in:draw="{{duration: 1000}}">
			<g stroke={colors.blue}>
				<path d="M197.8 30.4V6.3"/>
				<path d="M197.8 54.5V30.4"/>
				<path d="M197.8 79.3V54.5"/>
				<path d="M222.4 123.8L203.7 105a20 20 0 01-5.9-14.1V79.3"/>
				<path d="M253.3 154.8l-30.9-31"/>
				<path d="M292.5 193.9l-39.2-39.1"/>
				<path d="M303.9 237.2l7.5-7.5a12 12 0 000-17L292.5 194"/>
				<path d="M273.2 267.9l30.7-30.7"/>
			</g>
			<g stroke={colors.green}>
				<path d="M327.8 30.6V6.3"/>
				<path d="M327.8 54.9V30.6"/>
				<path d="M327.8 79.4V54.9"/>
				<path d="M314.8 111.3l7.2-7.2a20 20 0 005.8-14.1V79.4"/>
				<path d="M298 128.1l16.8-16.8"/>
				<path d="M271.3 154.8l26.7-26.7"/>
				<path d="M214.5 211.6l56.8-56.8"/>
			</g>
			<g stroke={colors.red}>
				<path d="M132.8 129.8V99.3"/>
				<path d="M158.4 174.8L138.7 155a20 20 0 01-5.9-14.1v-11.3"/>
				<path d="M195.2 211.6l-36.8-36.8"/>
				<path d="M229.2 245.6l-34-34"/>
				<path d="M251.5 267.9l-22.3-22.3"/>
				<path d="M283.3 299.7l-31.8-31.8"/>
				<path d="M308.3 324.7l-25-25"/>
				<path d="M327.8 364.8v-12.3a20 20 0 00-5.8-14.1l-13.7-13.7"/>
				<path d="M327.8 387.3v-22.5"/>
				<path d="M327.8 410.2v-22.9"/>
				<path d="M327.8 433.1v-22.9"/>
				<path d="M327.8 456v-22.9"/>
			</g>
    </g>

    <use width="15.9"  height="15.3" transform="translate(245.93 261.28)" xlink:href="#a"/>
		<use width="15.9" height="15.3" transform="translate(189.61 204.95)" xlink:href="#a"/>
		<use width="15.9" height="15.3" transform="translate(262.33 148.12)" xlink:href="#c"/>
		<use width="15.9" height="15.3" transform="translate(205.5 204.95)" xlink:href="#c"/>
		<use width="15.9" height="15.3" transform="translate(246.44 148.12)" xlink:href="#e"/>
  	<use width="15.9" height="15.3" transform="matrix(-1, 0, 0, 1, 277.72, 261.28)" xlink:href="#e"/>
    
		<g fill={colors.green}>
			<use width="5" height="10.3" transform="translate(335.62 28.11) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(335.62 3.8) rotate(90)" xlink:href="#g"/>	
			<use width="5" height="10.3" transform="translate(335.62 52.43) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(305.14 131.96) rotate(135)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(322.1 115) rotate(135)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(335.62 76.75) rotate(90)" xlink:href="#g"/>
		</g>

		<g fill={colors.blue}>
			<use width="5" height="10.3" transform="translate(311.05 241.05) rotate(135)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(296.28 186.67) rotate(45)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(226.1 116.49) rotate(45)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(205.62 76.65) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(205.62 52.41) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(205.62 28.1) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(205.62 3.8) rotate(90)" xlink:href="#g"/>		
		</g>

		<g fill={colors.red}>
			<use width="5" height="10.3" transform="translate(125.03 104.19) rotate(-90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(125.03 132.27) rotate(-90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(225.49 252.93) rotate(-135)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(155.15 182.59) rotate(-135)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(304.8 332.25) rotate(-135)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(279.57 307.02) rotate(-135)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(335.62 362.57) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(335.62 407.63) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(335.62 385.1) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(335.62 430.16) rotate(90)" xlink:href="#g"/>
			<use width="5" height="10.3" transform="translate(335.62 452.7) rotate(90)" xlink:href="#g"/>
		</g>

    <g fill={colors.textColor} font-family="Verdana, Verdana" font-size="12">
      <text transform="translate(339.7 9.1)">
        Героїв праці
      </text>
      <text transform="translate(339.7 33)">
        Студентська
      </text>
      <text transform="translate(339.7 57.7)">
        Академіка Павлова
      </text>
      <text transform="translate(339.7 81.8)">
        Академіка Барабашова
      </text>
      <text transform="translate(325.8 120.4)">
        Київська
      </text>
      <text transform="translate(308 141.4)">
        Пушкінська
      </text>
      <text transform="translate(282.2 163.4)">
        Університет
      </text>
      <text transform="translate(225.4 217)">
        Історичний<tspan x="0" y="12">музей</tspan>
      </text>
      <text transform="translate(302.8 189.5)">
        Архітектора Бекетова
      </text>
      <text transform="translate(229 114.9)">
        Наукова
      </text>
      <text transform="translate(209.8 82.3)">
        Ботанічний сад
      </text>
      <text transform="translate(209.8 57.7)">
        23 серпня
      </text>
      <text transform="translate(210.8 33)">
        Олексіївська
      </text>
      <text transform="translate(210.3 9)">
        Перемога
      </text>
      <text transform="translate(180.6 163)">
        Держпром
      </text>
      <text transform="translate(315.6 248.2)">
        Захисників України
      </text>
      <text transform="translate(282.2 278)">
        Метробудівників
      </text>
      <text transform="translate(340.2 367.6)">
        Палац спорту
      </text>
      <text transform="translate(340.2 390)">
        Армійська
      </text>
      <text transform="translate(340.7 412.4)">
        Імені Масельського
      </text>
      <text transform="translate(340.8 434)">
        Тракторний завод
      </text>
      <text transform="translate(340.2 457.2)">
        Індустріальна
      </text>
      <text transform="translate(176.7 278)">
        Спортивна
      </text>
      <text transform="translate(136.1 313.1)">
        Завод імені Малишева
      </text>
      <text transform="translate(235.7 340.1)">
        Турбоатом
      </text>
      <text transform="translate(103.6 252.8)">
        Проспект Гагаріна
      </text>
      <text transform="translate(63.1 217.8)">
        Майдан Конституції
      </text>
      <text transform="translate(24.1 183.9)">
        Центральний ринок
      </text>
      <text transform="translate(9.4 132.2)">
        Південний вокзал
      </text>
      <text transform="translate(36.8 104.3)">
        Холодна гора
      </text>
    </g>
</svg> -->
</div>