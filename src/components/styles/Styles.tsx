import { makeStyles, tokens, typographyStyles, } from "@fluentui/react-components";

export const mainLayoutStyles = makeStyles({
	// Flex spacing helpers
	spaceBetweenCol: {
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
	},
	spaceBetweenRow: {
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
	},
	/////////////////////////////
	// Layout & Global Styles //
	/////////////////////////////

	// Debug / dev helpers
	debugBG: {
		background: tokens.colorPaletteRedBackground1,
	},

	// Top-level layouts
	publicLayout: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		width: "100%",
		height: "100vh",
		flex: 1,
	},

	userLayout: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "row",
		width: "100%",
		height: "100vh",
		flex: 1,
	},

	contentsLayout: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		width: "100%",
		flex: 1,
		gap: tokens.spacingVerticalL,
	},

	// Background / card surfaces

	componentBorder: {
		borderRadius: "24px"
	},

	mainBackground: {
		background: tokens.colorNeutralBackground2Hover,
	},

	artifCard: {
		background: tokens.colorNeutralBackground1,
		boxShadow: tokens.shadow4,
		borderRadius: tokens.borderRadiusMedium,
	},

	///////////////
	// Helpers
	///////////////
	flexColFill: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		flex: 1,
	},

	flexColFit: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
	},

	flexRowFill: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "row",
		flex: 1,
	},

	flexRowFit: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "row",
	},

	// New helpers for width/height control (Tailwind-like)
	wFull: {
		width: "100%",
	},
	wAuto: {
		width: "auto",
	},
	hFull: {
		height: "100%",
	},
	hAuto: {
		height: "auto",
	},

	layoutPadding: {
		boxSizing: "border-box",
		padding: tokens.spacingHorizontalL,
	},

	alignCenter: {
		alignItems: "center",
		justifyContent: "center",
	},

	spaceBetween: {
		justifyContent: 'space-between',
	},

	gap: {
		gap: tokens.spacingVerticalL,
	},

	largeGap: {
		gap: "4rem",
	},

	pointer: {
		cursor: "pointer",
	},

	boldText: {
		fontSize: tokens.fontSizeBase500,
		fontWeight: tokens.fontWeightBold,
	},

	///////////////////////////
	// Headers & Branding
	///////////////////////////
	header: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "row",
		width: "100%",
		height: "auto",
		alignContent: 'center',
		justifyContent: 'space-between',
	},

	logoIcon: {
		width: "36px",
		height: "36px",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
	},

	brand: {
		...typographyStyles.title2,
		color: tokens.colorBrandForeground1,
		margin: 0
	},

	brandTitle: {
		...typographyStyles.display,
		color: tokens.colorBrandForeground1,
		margin: 0,
	},

	///////////////////////////
	// Sidebar & Navigation
	///////////////////////////
	sidebar: {
		maxWidth: "20vw",
	},

	/* styles for top-level nav items (My Tasks, Projects heading) */
	navMainItem: {
		background: tokens.colorNeutralBackground2,
	},

	/* styles for compact sub items under categories */
	navSubItem: {
		minHeight: "2rem",
		alignItems: "center",
		justifyContent: "flex-start",
		marginTop: tokens.spacingVerticalXXS,
		padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalL}`,
		borderRadius: tokens.borderRadiusSmall,
		background: tokens.colorNeutralBackground3,
	},

	///////////////
	// User text / persona
	///////////////


	personaRow: {
		display: "flex",
		alignItems: "center",
		gap: tokens.spacingHorizontalM,
	},

	///////////////
	// Form helpers
	///////////////
	formSection: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalL,
	},

	formRow: {
		display: "flex",
		flexDirection: "row",
		gap: tokens.spacingHorizontalM,
		"@media (max-width: 768px)": {
			flexDirection: "column",
		},
	},

	formField: {
		display: "flex",
		flexDirection: "column",
		flex: 1,
		gap: tokens.spacingVerticalXS,
	},

	errorText: {
		color: tokens.colorPaletteRedForeground1,
		fontSize: tokens.fontSizeBase200,
	},

	textareaMinHeight: {
		minHeight: "100px",
	},

	///////////////////////////
	// Page / Section helpers
	///////////////////////////
	section: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalS,
	},

	sectionTitle: {
		...typographyStyles.subtitle1,
		fontWeight: tokens.fontWeightSemibold,
		margin: 0,
	},

	pageTitle: {
		...typographyStyles.title1,
		margin: 0,
	},

	fullWidth: {
		width: "100%",
	},
	actionsLeft: {
		display: "flex",
		justifyContent: "flex-start",
		// gap: tokens.spacingHorizontalM,
		// marginTop: tokens.spacingVerticalL,
	},

	actionsRight: {
		display: "flex",
		justifyContent: "flex-end",
		// gap: tokens.spacingHorizontalM,
		// marginTop: tokens.spacingVerticalL,
	},



	///////////////////////////
	// Home Hero
	///////////////////////////

	homeBgImage: {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		objectFit: "cover",
		zIndex: 0,
		opacity: 0.2,
		pointerEvents: "none",
	},
	homeContent: {
		position: "relative",
		zIndex: 1,
		maxWidth: "700px",
		width: "100%",
		height: "50vh",
		maxHeight: "680px",
		margin: "0 auto",
		borderRadius: tokens.borderRadiusLarge,
		paddingTop: tokens.spacingVerticalXXXL,
		paddingBottom: tokens.spacingVerticalXXXL,
		paddingLeft: tokens.spacingHorizontalXXL,
		paddingRight: tokens.spacingHorizontalXXL,
	},
	homeEyebrow: {
		...typographyStyles.title3,
	},
	homeTitle: {
		...typographyStyles.display,
		color: tokens.colorBrandBackground,
		margin: 0,

		textAlign: "center",
	},
	homeActions: {
		gap: tokens.spacingHorizontalM,
		marginTop: tokens.spacingVerticalL,
	},
});


// Login styles - Used
export const useLoginForm = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		height: "auto",
		width: "55%",
		padding: tokens.spacingVerticalXXL,

		gap: tokens.spacingVerticalXXXL,
	},
	title: {
		...typographyStyles.title2,
		textAlign: "left",
	},
	field: {
		display: "flex",
		flexDirection: "column",
		width: "auto",
		gap: tokens.spacingVerticalXS,
	},
	form: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalXXXL,
	},
	actions: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalS,
	},
});

// Register styles - Used
export const useRegisterForm = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		width: "100vh",
		padding: tokens.spacingVerticalXXL,
		gap: tokens.spacingVerticalL,
	},
	header: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalXS,
	},
	title: {
		...typographyStyles.title1,
		color: tokens.colorBrandBackground,
		margin: 0,
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalM,
	},
	sectionTitle: {
		...typographyStyles.subtitle1,
		fontWeight: tokens.fontWeightSemibold,
	},
	row: {
		display: "flex",
		flexDirection: "row",
		gap: tokens.spacingHorizontalM,
		"@media (max-width: 768px)": {
			flexDirection: "column",
		},
	},
	field: {
		display: "flex",
		flexDirection: "column",
		flex: 1,
		gap: tokens.spacingVerticalXS,
	},
	errorText: {
		color: tokens.colorPaletteRedForeground1,
		fontSize: tokens.fontSizeBase200,
	},
	actions: {
		display: "flex",
		flexDirection: "row",
		gap: tokens.spacingHorizontalM,
		justifyContent: "flex-end",
		marginTop: tokens.spacingVerticalL,
	},
	primaryButton: {
		minWidth: "150px",
	},
	secondaryButton: {
		minWidth: "150px",
	},
});

// Note: Home hero styles have been moved into `mainLayoutStyles` as home-prefixed keys

// Stats header styles Todo: Maybe a new kwan for dashboard nalang
export const useStatsStyles = makeStyles({
	statsRow: {
		display: "flex",
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		gap: "64px",
	},
	statItem: {
		display: "flex",
		alignItems: "center",
		gap: "6px",
	},
	statNumber: {
		fontWeight: 600,
		fontSize: "18px",
	},
	statLabel: {
		color: tokens.colorNeutralForeground3,
		fontSize: "16px",
	},
});
