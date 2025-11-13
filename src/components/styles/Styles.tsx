import {
	makeStyles,
	tokens,
	typographyStyles,
} from "@fluentui/react-components";

///////////////////
// LAYOUT STYLES //
///////////////////

// Public Layout
export const publicLayoutStyles = makeStyles({
	layoutContainer: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalL,
		padding: tokens.spacingVerticalL,
		background: tokens.colorNeutralBackground1Pressed,
	},
	header: {},
	mainContent: {
		// margin: tokens.spacingVerticalL,
	},
	sectionContent: {
		margin: tokens.spacingVerticalS,
		padding: tokens.spacingVerticalS,
	},
});

// User Layout
export const userLayoutStyles = makeStyles({
	layoutContainer: {
		display: "flex",
		flexDirection: "row",
		width: "100vw",
		height: "100vh",
		gap: tokens.spacingVerticalL,
		padding: tokens.spacingVerticalL,
		background: tokens.colorNeutralBackground1Pressed,
		boxSizing: "border-box",
		overflow: "hidden",
	},
	mainContent: {
		display: "flex",
		width: "100vw",
		flexDirection: "column",
		gap: tokens.spacingHorizontalL,
	},
	header: {
		display: "flex",
		flexDirection: "row",
		height: "auto",
		gap: tokens.spacingHorizontalL,
	},
	sectionContent: {
		flex: 1,
		display: "flex",
		flexDirection: "column",

		backgroundColor: tokens.colorNeutralBackground2,
		overflow: "auto",
		minHeight: 0,
	},
});

//////////////////
// PAGES STYLES //
//////////////////

// Login Page
export const useLoginPageStyle = makeStyles({
	layoutContainer: {
		display: "flex",
		flexDirection: "row",
		height: "86vh",
		gap: tokens.spacingVerticalL,
		padding: 0,
	},

	right: {
		textShadow: `0 0 24px ${tokens.colorBrandBackground}, 0 0 48px ${tokens.colorPaletteMagentaBackground2}`,
		display: "flex",
		height: "100%",
		"0%": {
			textShadow: `0 0 24px ${tokens.colorBrandBackground}, 0 0 48px ${tokens.colorPaletteMagentaBackground2}`,
		},
		"100%": {
			textShadow: `0 0 48px ${tokens.colorPaletteMagentaBackground2}, 0 0 24px ${tokens.colorBrandBackground}`,
		},
		alignItems: "left",
		gap: 0,
		padding: 0,
	},
	card: {
		padding: 0,
	},
	cardTitleContainer: {
		padding: tokens.spacingVerticalXXL,
	},
	image: {
		width: "100%",
		objectFit: "contain",
		padding: 0,
	},
	eyebrow: {
		...typographyStyles.title3,
	},
	title: {
		...typographyStyles.largeTitle,
		color: tokens.colorBrandBackground,
		margin: 0,
		textAlign: "left",
	},
});

// Register Page
export const useRegisterPageStyle = makeStyles({
	layoutContainer: {
		display: "flex",
		height: "auto",
		gap: tokens.spacingVerticalL,
		// background: tokens.colorPaletteRedBackground2 // for debug
	},

	right: {
		display: "flex",
		height: "100%",
		width: "100%",
	},
	card: {
		display: "flex",
		width: "100%",
		alignItems: "left",
		gap: 0,
		padding: 0,
	},
	cardTitleContainer: {
		padding: tokens.spacingVerticalXXL,
	},

	image: {
		width: "100%",
		objectFit: "contain",
		padding: 0,
	},
	eyebrow: {
		...typographyStyles.title3,
	},
	title: {
		...typographyStyles.largeTitle,
		color: tokens.colorBrandBackground,
		margin: 0,
		textAlign: "left",
	},
});

//////////////////////
// COMPONENT STYLES //
/////////////////////

// Login styles
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

// Register styles
export const useRegisterForm = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		height: "auto",
		width: "250vh",
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

// Public header styles
export const usePublicHeaderStyles = makeStyles({
	header: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
		height: "56px",
		paddingLeft: tokens.spacingHorizontalL,
		paddingRight: tokens.spacingHorizontalL,
		backgroundColor: tokens.colorNeutralBackground1,
		gap: tokens.spacingHorizontalM,
	},
	left: {
		display: "flex",
		alignItems: "center",
		gap: tokens.spacingHorizontalS,
	},
	logoIcon: {
		width: "48px",
		height: "48px",
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
	},
	brand: {
		...typographyStyles.title3,
	},
	nav: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "100px",
		flex: 1,
	},
	navLabel: {
		fontSize: "14px",
	},
	right: {
		display: "flex",
		alignItems: "center",
		gap: tokens.spacingHorizontalM,
	},
});


// Task-related styles
export const useMyTasksCardStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		width: "100%",
		maxWidth: "auto",
		minHeight: "100%",
		padding: tokens.spacingVerticalXXL,
	},
});

export const useMyTasksDataGridStyles = makeStyles({
	root: {},
	headerRow: {
		display: "flex",
		alignItems: "center",
		justifyContent: "space-between",
	},
	title: {
		margin: 0,
	},
});

// Home styles
export const useHomeHeroStyles = makeStyles({
	root: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		minHeight: "91vh", // fallback for hero height
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

// Sidebar styles
export const useSidebarStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		width: "25%",
		height: "auto",
	},
	drawer: {
		display: "flex",
		flexDirection: "column",
		width: "auto",
		height: "100%",
		alignItems: "left",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalS,
	},
	body: {
		display: "flex",
		flexDirection: "column",
		width: "auto",
		height: "100%",
		alignItems: "left",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalS,

	},
	bodyItems: {
		display: "flex",
		flexDirection: "column",
		height: "auto",
		alignItems: "left",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalS,

	},
	headerContainer: {
		display: "flex",
		flexDirection: "row",
		width: "auto",
		gap: tokens.spacingVerticalS,
		padding: tokens.spacingHorizontalM,
		alignItems: "center",
		justifyContent: "center",

	},
});

export const useSidebarProfileActionsStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		width: "auto%",
		height: "auto",
		alignItems: "center",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalL,
	},
	actionsContainer: {
		width: "100%",
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalL,
		alignItems: "center",
		justifyContent: "center",
	},
	button: {
		width: "100%",
	},
});

export const useRegisterFormStyles = makeStyles({
	root: {
		height: "100vh",
		maxWidth: "400px",
		maxHeight: "1000px",
		display: "flex",
		flexDirection: "column",
		margin: "0 auto",
		padding: tokens.spacingHorizontalXXL,
	},
	title: {
		...typographyStyles.title2,
		textAlign: "left",
		marginBottom: tokens.spacingVerticalL,
	},
	field: {
		display: "flex",
		flexDirection: "column",
	},
	form: {
		display: "flex",
		flexDirection: "column",
	},
	section: {
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalL,
		marginBottom: tokens.spacingVerticalXXL,
		padding: `${tokens.spacingVerticalL} 0`,
	},
	sectionTitle: {
		...typographyStyles.subtitle1,
		color: tokens.colorNeutralForeground2,
		marginBottom: tokens.spacingVerticalM,
	},
	actions: {
		marginTop: tokens.spacingVerticalL,
		display: "flex",
		flexDirection: "column",
		gap: tokens.spacingVerticalS,
	},
});

// My Profile
export const useProfileStyles = makeStyles({
	card: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalXL,
		padding: tokens.spacingVerticalXXL,
		// background: tokens.colorPaletteRedBackground2, // for debug
		width: '100%',
		height: '100%'
	},
	titleRow: {
		display: 'flex',
		alignItems: 'center',
		gap: tokens.spacingHorizontalM,
	},
	title: {
		...typographyStyles.title2,
		margin: 0,
	},
	userRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: tokens.spacingHorizontalL,
	},
	userInfo: {
		display: 'flex',
		alignItems: 'center',
		gap: tokens.spacingHorizontalL,
	},
	userText: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalXS,
	},
	userName: {
		...typographyStyles.subtitle1,
		fontWeight: tokens.fontWeightSemibold,
	},
	userSecondary: {
		...typographyStyles.body1,
		color: tokens.colorNeutralForeground2,
	},
	formSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalL,
	},
	row: {
		display: 'flex',
		flexDirection: 'row',
		gap: tokens.spacingHorizontalM,
		'@media (max-width: 768px)': {
			flexDirection: 'column',
		},
	},
	field: {
		display: 'flex',
		flexDirection: 'column',
		flex: 1,
		gap: tokens.spacingVerticalXS,
	},
	errorText: {
		color: tokens.colorPaletteRedForeground1,
		fontSize: tokens.fontSizeBase200,
	},
});

export const useHomeHeaderStyles = makeStyles({
	header: {
		display: 'flex',
		flexDirection: 'row',
		width: '100%',
		height: 'auto',
		justifyContent: 'space-between',
		alignItems: 'stretch',
		gap: '32px'
	},
	leftCard: {
		display: 'flex',
		flexDirection: 'row',
		background: tokens.colorNeutralBackground1,
		padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalXL}`,
		justifyContent: 'space-between',
		alignItems: 'center',
		flex: 1,
	},
	greetingCol: {
		display: 'flex',
		flexDirection: 'column',
		width: 'auto',
	},
	greetingTitle: {
		width: "100%",
		...typographyStyles.title1
	},
	greetingName: {
		color: tokens.colorNeutralForeground3,
		fontSize: '18px',

	},
	statsRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: '64px',

	},
	statItem: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
	},
	statNumber: {
		fontWeight: 600,
		fontSize: '18px',
	},
	statLabel: {
		color: tokens.colorNeutralForeground3,
		fontSize: '16px',

	},
	rightCard: {
		display: 'flex',
		flexDirection: 'row',
		background: tokens.colorNeutralBackground1,
		alignItems: 'center',
		minWidth: 0,

	},
	dateCol: {
		display: 'flex',
		flexDirection: 'column',
		gap: '8px',
		minWidth: 0,

	},
	dateTitle: {
		fontSize: '28px',
		fontWeight: 600,
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
	},
	moonIcon: {
		fontSize: '28px',

	},
	dateTime: {
		color: tokens.colorNeutralForeground3,
		fontSize: '16px',

	},
	todayCol: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-end',
		minWidth: 0,
	},
	todayCount: {
		fontSize: '28px',
		fontWeight: 600,
	},
	todayLabel: {
		color: tokens.colorNeutralForeground3,
		fontSize: '16px',
	},
});

// Stats header styles (shared)
export const useStatsStyles = makeStyles({
	statsRow: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		gap: '64px',
	},
	statItem: {
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
	},
	statNumber: {
		fontWeight: 600,
		fontSize: '18px',
	},
	statLabel: {
		color: tokens.colorNeutralForeground3,
		fontSize: '16px',
	},
});