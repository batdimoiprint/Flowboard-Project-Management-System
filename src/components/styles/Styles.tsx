import { makeStyles, tokens, typographyStyles, } from "@fluentui/react-components";

export const mainLayoutStyles = makeStyles({
	/////////////////////////////
	// GLOBAL REUSABLE STYLES //
	////////////////////////////


	debugBG: {
		background: tokens.colorPaletteRedBackground1,
		// padding: "0",
	},

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

	mainBackground: {
		background: tokens.colorNeutralBackground2Hover
	},

	artifCard: {
		background: tokens.colorNeutralBackground1,
		boxShadow: tokens.shadow4,
		borderRadius: tokens.borderRadiusMedium
	},

	// Helpers
	flexColFill: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",
		height: "100%",
		flex: 1,
	},

	flexColFit: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "column",

		height: "100%",
	},
	flexRowFill: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "row",
		width: "100%",
		flex: 1,
	},
	flexRowFit: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "row",
		width: "auto",
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
		justifyContent: 'space-between'
	},

	gap: {
		gap: tokens.spacingVerticalL,
	},

	largeGap: {
		gap: "4rem"
	},

	pointer: {
		cursor: "pointer"
	},

	boldText: {
		fontSize: tokens.fontSizeBase500,
		fontWeight: tokens.fontWeightBold
	},


	/////////////////////////////////
	// COMPONENTS REUSABLE STYLES //
	////////////////////////////////
	// Headers
	header: {
		boxSizing: "border-box",
		display: "flex",
		flexDirection: "row",
		width: "100%",
		height: "auto",
		alignContent: 'center',
		justifyContent: 'space-between'
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
		color: tokens.colorBrandForeground1
	},

	sidebar: {
		maxWidth: "20vw",
	},

	/* styles for top-level nav items (My Tasks, Projects heading) */
	navMainItem: {
		background: tokens.colorNeutralBackground2,
	},

	// For Sidebar export

	/* styles for compact sub items under categories */
	navSubItem: {
		minHeight: "36px",
		alignItems: "center",
		justifyContent: "flex-start",
		marginTop: tokens.spacingVerticalXXS,
		padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalL}`,
		borderRadius: tokens.borderRadiusSmall,
		background: tokens.colorNeutralBackground3,
	},


	// Login
	noPadding: {
		padding: "0"
	},

	brandTitle: {
		...typographyStyles.display,
		color: tokens.colorBrandForeground1,
		margin: 0,
	},

	// Layout helpers and component-specific global styles
	// Reusable user text styles
	userName: {
		...typographyStyles.subtitle1,
		fontWeight: tokens.fontWeightSemibold,
	},
	userSecondary: {
		...typographyStyles.body1,
		color: tokens.colorNeutralForeground2,
	},
	// Generic form helpers
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
	// Generic page/section helpers
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
	textareaMinHeight: {
		minHeight: "100px",
	},
	personaRow: {
		display: "flex",
		alignItems: "center",
		gap: tokens.spacingHorizontalM,
	},
	inviteRow: {
		display: "flex",
		alignItems: "center",
		gap: tokens.spacingHorizontalS,
		cursor: "pointer",
	},
	actionsRight: {
		display: "flex",
		justifyContent: "flex-end",
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

// Home styles - Used
export const useHomeHeroStyles = makeStyles({
	root: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		// minHeight: "91vh", // fallback for hero height
		paddingTop: tokens.spacingVerticalNone,
		paddingBottom: tokens.spacingVerticalXXXL,
		paddingLeft: tokens.spacingHorizontalXXL,
		paddingRight: tokens.spacingHorizontalXXL,
		overflow: "hidden",
	},
	bgImage: {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		objectFit: "cover",
		zIndex: 0,
		opacity: 0.3,
		pointerEvents: "none",
	},
	content: {
		position: "relative",
		zIndex: 1,
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
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
	eyebrow: {
		...typographyStyles.title3,
	},
	title: {
		...typographyStyles.display,
		color: tokens.colorBrandBackground,
		margin: 0,
		textAlign: "center",
	},
	actions: {
		display: "flex",
		gap: tokens.spacingHorizontalM,
		marginTop: tokens.spacingVerticalL,
		justifyContent: "center",
	},
});

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
