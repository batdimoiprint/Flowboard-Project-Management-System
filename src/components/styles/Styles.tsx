// MyTasksDataGrid Card styles
export const useMyTasksCardStyles = makeStyles({
	root: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		maxWidth: 'auto',
		minHeight: '100%',

		padding: tokens.spacingVerticalXXL,

	},
});
// MyTasksDataGrid styles
export const useMyTasksDataGridStyles = makeStyles({
	root: {

	},
	headerRow: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',

	},
	title: {
		margin: 0,
	},
});
import { makeStyles, tokens, typographyStyles } from '@fluentui/react-components';





// HomeHero styles
export const useHomeHeroStyles = makeStyles({
	root: {
		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: "91vh", // fallback for hero height
		paddingTop: tokens.spacingVerticalNone,
		paddingBottom: tokens.spacingVerticalXXXL,
		paddingLeft: tokens.spacingHorizontalXXL,
		paddingRight: tokens.spacingHorizontalXXL,
		overflow: 'hidden',
	},
	bgImage: {
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		zIndex: 0,
		opacity: 0.30,
		pointerEvents: 'none',
	},
	content: {
		position: 'relative',
		zIndex: 1,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		maxWidth: '700px',
		width: '100%',
		height: '50vh',
		maxHeight: '680px',
		margin: '0 auto',
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
		textAlign: 'center',
	},
	actions: {
		display: 'flex',
		gap: tokens.spacingHorizontalM,
		marginTop: tokens.spacingVerticalL,
		justifyContent: 'center',
	},
});

// Sidebar styles
export const useSidebarStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		width: '100%',
		maxWidth: "40dvh",
		margin: tokens.spacingHorizontalL,
		padding: tokens.spacingHorizontalL,

	},
	drawer: {
		display: "flex",
		flexDirection: "column",
		width: 'auto',
		height: '100%',
		alignItems: "left",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalS
	},

	body: {
		display: "flex",
		flexDirection: "column",
		width: 'auto',
		height: '100%',
		alignItems: "left",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalS
	},
	bodyItems: {
		display: "flex",
		flexDirection: "column",
		height: 'auto',
		alignItems: "left",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalS

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

// SidebarProfileActions styles
export const useSidebarProfileActionsStyles = makeStyles({
	root: {
		display: "flex",
		flexDirection: "column",
		width: 'auto%',
		height: 'auto',
		alignItems: "center",
		justifyContent: "space-between",
		gap: tokens.spacingVerticalL,
	},

	actionsContainer: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalL,
		alignItems: 'center',
		justifyContent: 'center',

	},

	button: {
		width: '100%',
	},
});

// PublicHeader styles
export const usePublicHeaderStyles = makeStyles({
	header: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		height: '56px',
		paddingLeft: tokens.spacingHorizontalL,
		paddingRight: tokens.spacingHorizontalL,
		backgroundColor: tokens.colorNeutralBackground1,
		gap: tokens.spacingHorizontalM,
	},
	left: {
		display: 'flex',
		alignItems: 'center',
		gap: tokens.spacingHorizontalS,
	},
	logoIcon: {
		width: '48px',
		height: '48px',
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	brand: {
		...typographyStyles.title3,
	},
	nav: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '100px',
		flex: 1,
	},
	navLabel: {
		fontSize: '14px',
	},
	right: {
		display: 'flex',
		alignItems: 'center',
		gap: tokens.spacingHorizontalM,
	},
});

// Login Styles
export const useLoginForm = makeStyles({
	root: {
		height: '100%',
		width: '100%',
		display: 'flex',
		flexDirection: 'column',



	},
	title: {
		...typographyStyles.title2,
		textAlign: 'left',

	},

	field: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalXS,
	},
	form: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalXXXL,
	},
	actions: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalS,
	},
});


// Register Styles

export const useRegisterFormStyles = makeStyles({
	root: {
		height: '100vh',
		maxWidth: '400px',
		maxHeight: '1000px',
		display: 'flex',
		flexDirection: 'column',
		margin: '0 auto',
		padding: tokens.spacingHorizontalXXL,


	},
	title: {
		...typographyStyles.title2,
		textAlign: 'left',
		marginBottom: tokens.spacingVerticalL,
	},
	field: {
		display: 'flex',
		flexDirection: 'column',

	},
	form: {
		display: 'flex',
		flexDirection: 'column',

	},
	section: {
		display: 'flex',
		flexDirection: 'column',
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
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalS,
	},
});



