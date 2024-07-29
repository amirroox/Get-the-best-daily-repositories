import type { SVGProps } from "react";

interface Props extends SVGProps<SVGSVGElement> {}

const Logo = (props: Props) => (
	<svg
		width="1em"
		height="1em"
		viewBox="0 0 950 776"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			d="M474.767 423.538C455.462 411.154 442.183 393.501 426.353 378.552C402.307 355.846 379.498 331.835 355.727 308.83C348.396 301.735 349.004 297.244 356.094 290.196C449.996 196.842 543.765 103.351 637.092 9.42216C647.671 -1.22591 654.383 -0.661581 664.499 9.51514C757.291 102.869 850.341 195.968 943.662 288.794C952.388 297.473 951.888 302.735 943.489 311.106C814.018 440.139 684.82 569.448 555.54 698.673C531.773 722.431 507.714 745.903 484.232 769.938C477.214 777.12 472.452 776.946 465.424 769.892C334.616 638.581 203.631 507.446 72.6483 376.309C50.6984 354.334 28.7997 332.299 6.4313 310.754C-2.00331 302.63 -2.31577 297.237 6.52796 288.441C99.2289 196.246 191.474 103.592 283.828 11.0473C298.343 -3.49808 299.386 -3.83041 314.232 10.943C348.154 44.6994 381.53 79.0085 415.675 112.536C424.251 120.957 424.366 126.616 415.896 135.026C367.128 183.453 318.842 232.365 270.199 280.918C252.741 298.342 252.281 300.429 269.113 317.318C333.397 381.82 397.79 446.212 462.117 510.671C469.193 517.761 475.514 522.475 485.027 512.907C553.563 443.971 622.436 375.369 691.166 306.625C692.916 304.875 694.254 302.714 696.461 299.873C685.026 283.869 669.905 271.717 656.427 258.084C649.193 250.768 644.457 257.723 639.998 262.155C611.474 290.503 583.123 319.025 554.693 347.468C532.382 369.79 510.109 392.15 487.638 414.309C484.117 417.781 481.344 422.499 474.767 423.538Z"
			fill="currentColor"
		/>
	</svg>
);

export default Logo;
