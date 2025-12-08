import { makeStyles, tokens, typographyStyles } from "@fluentui/react-components";

export const mainLayoutStyles = makeStyles({
	///////////////////////////
	// Animation Utilities
	///////////////////////////
	fadeIn: {
		animationName: {
			from: { opacity: 0, transform: 'translateY(20px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	fadeInFast: {
		animationName: {
			from: { opacity: 0, transform: 'translateY(20px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.4s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	fadeInSlow: {
		animationName: {
			from: { opacity: 0, transform: 'translateY(30px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.8s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	slideInLeft: {
		animationName: {
			from: { opacity: 0, transform: 'translateX(-50px)' },
			to: { opacity: 1, transform: 'translateX(0)' }
		},
		animationDuration: '0.6s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	slideInRight: {
		animationName: {
			from: { opacity: 0, transform: 'translateX(50px)' },
			to: { opacity: 1, transform: 'translateX(0)' }
		},
		animationDuration: '0.6s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	scaleIn: {
		animationName: {
			from: { opacity: 0, transform: 'scale(0.9)' },
			to: { opacity: 1, transform: 'scale(1)' }
		},
		animationDuration: '0.5s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	// Staggered animation delays
	delay100: { animationDelay: '0.1s' },
	delay200: { animationDelay: '0.2s' },
	delay300: { animationDelay: '0.3s' },
	delay400: { animationDelay: '0.4s' },
	delay500: { animationDelay: '0.5s' },
	delay600: { animationDelay: '0.6s' },

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

	debugBG: {
		background: tokens.colorPaletteRedBackground1,
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

	///////////////////////////
	// Kanban Board Styles
	///////////////////////////
	kanbanBoard: {
		boxSizing: 'border-box',
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: tokens.spacingHorizontalL,
		width: '100%',
		overflowX: 'auto',
		paddingBottom: tokens.spacingVerticalL,
	},
	kanbanColumn: {
		boxSizing: 'border-box',
		display: 'flex',
		flexDirection: 'column',
		flex: '0 0 280px',
		maxWidth: '300px',
		backgroundColor: tokens.colorNeutralBackground2,
		borderRadius: tokens.borderRadiusMedium,
		padding: tokens.spacingHorizontalM,
		gap: tokens.spacingVerticalS,
		boxShadow: tokens.shadow2,
	},
	kanbanColumnHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: tokens.spacingVerticalXS,
	},
	kanbanColumnTitle: {
		...typographyStyles.subtitle2,
		fontWeight: tokens.fontWeightSemibold,
		margin: 0,
	},
	kanbanTaskList: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalS,
		overflowY: 'auto',
		maxHeight: 'calc(100vh - 260px)',
		paddingRight: tokens.spacingHorizontalXS,
	},
	kanbanAddColumn: {
		flex: '0 0 240px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'stretch',
		padding: tokens.spacingHorizontalM,
		gap: tokens.spacingVerticalS,
		backgroundColor: tokens.colorNeutralBackground2Hover,
		borderRadius: tokens.borderRadiusMedium,
		boxShadow: tokens.shadow2,
		maxHeight: 'fit-content',
	},
	kanbanDragOver: {
		outline: `2px dashed ${tokens.colorBrandStroke1}`,
		outlineOffset: '2px',
	},
	kanbanTaskCard: {
		boxSizing: 'border-box',
		backgroundColor: tokens.colorNeutralBackground1,
		border: `1px solid ${tokens.colorNeutralStroke2}`,
		borderRadius: tokens.borderRadiusMedium,
		padding: tokens.spacingHorizontalM,
		boxShadow: tokens.shadow2,
		cursor: 'grab',
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalXS,
		':active': { cursor: 'grabbing' },
	},
	kanbanTaskTitle: {
		...typographyStyles.body1Strong,
		margin: 0,
	},
	kanbanTaskMetaRow: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		gap: tokens.spacingHorizontalS,
		flexWrap: 'wrap',
	},
	kanbanSmallBadge: {
		backgroundColor: tokens.colorNeutralBackground3,
		borderRadius: tokens.borderRadiusSmall,
		padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalS}`,
		fontSize: tokens.fontSizeBase100,
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

	navMainItem: {
		background: tokens.colorNeutralBackground2,
	},

	navSubItem: {
		minHeight: "2rem",
		alignItems: "center",
		justifyContent: "flex-start",
		marginTop: tokens.spacingVerticalXXS,
		padding: `${tokens.spacingVerticalXXS} ${tokens.spacingHorizontalL}`,
		borderRadius: tokens.borderRadiusSmall,
		background: tokens.colorNeutralBackground3,
	},

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

	sectionHeader: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: tokens.spacingVerticalM,
	},

	inputSearch: {
		minWidth: '280px',
	},

	inputSort: {
		minWidth: '175px',
	},

	centerPaddingL: {
		padding: tokens.spacingVerticalL,
		display: 'flex',
		justifyContent: 'center',
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
	},

	actionsRight: {
		display: "flex",
		justifyContent: "flex-end",
	},

	///////////////////////////
	// Home Hero (with animations)
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
		animationName: {
			from: { opacity: 0 },
			to: { opacity: 0.2 }
		},
		animationDuration: '1s',
		animationTimingFunction: 'ease-out',
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
		animationName: {
			from: { opacity: 0, transform: 'translateY(20px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationDelay: '0.2s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},
	homeTitle: {
		...typographyStyles.display,
		color: tokens.colorBrandBackground,
		margin: 0,
		textAlign: "center",
		animationName: {
			from: { opacity: 0, transform: 'translateY(30px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.8s',
		animationDelay: '0.4s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},
	homeActions: {
		gap: tokens.spacingHorizontalM,
		marginTop: tokens.spacingVerticalL,
		animationName: {
			from: { opacity: 0, transform: 'translateY(20px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationDelay: '0.6s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	///////////////////////////
	// Features Section (with animations)
	///////////////////////////
	featuresSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalL,
		padding: tokens.spacingHorizontalL,
		maxWidth: '100%',
		boxSizing: 'border-box',
	},

	topRectangle: {
		width: '100%',
		maxWidth: '100%',
		height: '120px',
		backgroundColor: tokens.colorNeutralBackground1,
		borderRadius: '20px',
		boxShadow: tokens.shadow4,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 0,
		overflow: 'hidden',
		boxSizing: 'border-box',
		animationName: {
			from: { opacity: 0, transform: 'translateY(30px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	topTextContainer: {
		flex: '1',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		gap: tokens.spacingVerticalS,
		padding: tokens.spacingHorizontalM,
	},

	topImageContainer: {
		flex: '1',
		height: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
	},

	topImage: {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		borderRadius: '0',
	},

	featureTitle: {
		...typographyStyles.title3,
		textAlign: 'left',
		marginLeft: tokens.spacingHorizontalXXL,
	},

	featureHighlight: {
		color: tokens.colorBrandForeground1,
		fontWeight: tokens.fontWeightBold,
		fontSize: tokens.fontSizeHero900,
	},

	boxContainer: {
		display: 'flex',
		flexDirection: 'row',
		gap: tokens.spacingHorizontalL,
		width: '100%',
		maxWidth: '100%',
		boxSizing: 'border-box',
	},

	shortWidthBox: {
		flex: '1',
		height: '300px',
		backgroundColor: tokens.colorNeutralBackground2,
		borderRadius: tokens.borderRadiusMedium,
		boxShadow: tokens.shadow4,
		padding: tokens.spacingHorizontalM,
		display: 'flex',
		flexDirection: 'column',
		gap: tokens.spacingVerticalS,
	},

	featureText: {
		...typographyStyles.title3,
		fontWeight: tokens.fontWeightSemibold,
	},

	featureDescription: {
		...typographyStyles.body1,
		color: tokens.colorNeutralForeground2,
	},

	rightBox: {
		flex: '2',
		height: '410px',
		backgroundColor: tokens.colorNeutralBackground1,
		borderRadius: '20px',
		boxShadow: tokens.shadow4,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		boxSizing: 'border-box',
		padding: 0,
		position: 'relative',
		animationName: {
			from: { opacity: 0, transform: 'translateX(50px)' },
			to: { opacity: 1, transform: 'translateX(0)' }
		},
		animationDuration: '0.6s',
		animationDelay: '0.3s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	rightBoxImage: {
		position: 'absolute',
		inset: 0,
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		borderRadius: '0',
	},

	bottomRectangle: {
		width: '100%',
		maxWidth: '100%',
		height: '120px',
		backgroundColor: tokens.colorNeutralBackground1,
		borderRadius: '20px',
		boxShadow: tokens.shadow4,
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		padding: 0,
		overflow: 'hidden',
		boxSizing: 'border-box',
		animationName: {
			from: { opacity: 0, transform: 'translateY(30px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationDelay: '0.4s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	featureFooter: {
		...typographyStyles.title2,
		textAlign: 'center',
	},

	leftBox: {
		height: '410px',
		flex: '1',
		maxWidth: '385px',
		minWidth: '300px',
		backgroundColor: tokens.colorNeutralBackground1,
		borderRadius: '20px',
		boxShadow: tokens.shadow4,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: tokens.spacingVerticalS,
		overflow: 'hidden',
		boxSizing: 'border-box',
		animationName: {
			from: { opacity: 0, transform: 'translateX(-50px)' },
			to: { opacity: 1, transform: 'translateX(0)' }
		},
		animationDuration: '0.6s',
		animationDelay: '0.2s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	leftBoxImage: {
		width: '100%',
		height: 'auto',
		objectFit: 'contain',
		borderRadius: '20px',
	},

	leftBoxButton: {
		width: '100%',
		height: '30px',
		borderRadius: '5px',
		backgroundColor: tokens.colorBrandBackground,
		color: tokens.colorNeutralForegroundOnBrand,
		textAlign: 'center',
		lineHeight: '20px',
		cursor: 'pointer',
		border: 'none',
		transition: 'transform 0.2s ease, box-shadow 0.2s ease',
		'&:hover': {
			transform: 'translateY(-2px)',
			boxShadow: tokens.shadow4,
		}
	},

	fourContainerRow: {
		display: 'flex',
		flexDirection: 'row',
		gap: tokens.spacingHorizontalL,
		width: '100%',
		maxWidth: '100%',
		boxSizing: 'border-box',
	},

	smallCard: {
		flex: '1',
		minWidth: '0',
		height: '430px',
		backgroundColor: tokens.colorNeutralBackground1,
		borderRadius: '20px',
		boxShadow: tokens.shadow4,
		display: 'flex',
		flexDirection: 'column',
		padding: tokens.spacingHorizontalM,
		gap: tokens.spacingVerticalS,
		boxSizing: 'border-box',
		animationName: {
			from: { opacity: 0, transform: 'translateY(40px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
		transition: 'transform 0.3s ease, box-shadow 0.3s ease',
		'&:hover': {
			transform: 'translateY(-5px)',
			boxShadow: tokens.shadow8,
		}
	},

	smallCardTitle: {
		...typographyStyles.subtitle1,
		fontWeight: tokens.fontWeightSemibold,
		textAlign: 'center',
		marginBottom: tokens.spacingVerticalS,
	},

	smallCardImageContainer: {
		flex: '1',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden',
		borderRadius: '0',
		margin: 0,
	},

	smallCardImage: {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
		borderRadius: '0',
	},

	///////////////////////////
	// Team Section (with animations)
	///////////////////////////
	teamSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
    backgroundColor: 'transparent',
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box',
    gap: tokens.spacingVerticalXXL,
},

teamLabelContainer: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '20px',
    boxShadow: tokens.shadow4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXL}`,
    marginBottom: tokens.spacingVerticalXL,
    boxSizing: 'border-box',
    animationName: {
        from: { opacity: 0, transform: 'scale(0.95)' },
        to: { opacity: 1, transform: 'scale(1)' }
    },
    animationDuration: '0.6s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
},

teamCardsContainer: {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: 'transparent',
    borderRadius: '20px',
    padding: tokens.spacingHorizontalXL,
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
},

teamHeaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens.spacingVerticalS,
    textAlign: 'center',
},

teamTitle: {
    ...typographyStyles.body1,
    color: tokens.colorNeutralForeground2,
    fontSize: tokens.fontSizeBase500,
    fontWeight: tokens.fontWeightRegular,
},

teamSubtitle: {
    ...typographyStyles.title1,
    color: tokens.colorPaletteBlueBorderActive,
    fontSize: tokens.fontSizeHero800,
    fontWeight: tokens.fontWeightBold,
},

teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(200px, 220px))',
    gridAutoRows: 'minmax(320px, auto)',
    gap: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    width: 'fit-content',
    maxWidth: '100%',
    boxSizing: 'border-box',
    justifyContent: 'center',
    '@media (max-width: 1300px)': {
        gridTemplateColumns: 'repeat(3, minmax(200px, 220px))',
    },
    '@media (max-width: 900px)': {
        gridTemplateColumns: 'repeat(2, minmax(200px, 220px))',
    },
    '@media (max-width: 600px)': {
        gridTemplateColumns: '1fr',
    },
},

teamCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: tokens.colorNeutralBackground1,
    borderRadius: '20px',
    boxShadow: tokens.shadow4,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    gap: tokens.spacingVerticalM,
    height: '320px',
    transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), box-shadow 0.3s ease',
    boxSizing: 'border-box',
    width: '100%',
    animationName: {
        from: { opacity: 0, transform: 'scale(0.9)' },
        to: { opacity: 1, transform: 'scale(1)' }
    },
    animationDuration: '0.5s',
    animationTimingFunction: 'ease-out',
    animationFillMode: 'both',
    '&:hover': {
        transform: 'translateY(-15px) scale(1.05)',
        boxShadow: tokens.shadow16,
        animation: '$bounce 0.6s ease-in-out',
    },
    // Bounce animation keyframes
    '@keyframes bounce': {
        '0%, 100%': {
            transform: 'translateY(-15px) scale(1.05)',
        },
        '50%': {
            transform: 'translateY(-20px) scale(1.07)',
        }
    }
},

teamImageContainer: {
    width: '95%',
    height: '220px',
    borderRadius: '0',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: tokens.spacingVerticalS,
    marginBottom: tokens.spacingVerticalS,
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.02)',
    },
},

teamImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '0',
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'scale(1.05)',
    },
},

teamInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: tokens.spacingVerticalXXS,
    width: '100%',
    padding: `0 ${tokens.spacingHorizontalS}`,
},

teamMemberName: {
    ...typographyStyles.subtitle1,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    textAlign: 'center',
    lineHeight: '1.2',
},

teamMemberRole: {
    ...typographyStyles.caption1,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
    lineHeight: '1.3',
},

	///////////////////////////
	// CTA Section (with animations)
	///////////////////////////
	ctaSection: {
		width: '100%',
		maxWidth: '100%',
		marginTop: tokens.spacingVerticalXXL,
		marginBottom: tokens.spacingVerticalXXL,
		position: 'relative',
		overflow: 'hidden',
		borderRadius: '24px',
		minHeight: '50vh',
		maxHeight: '680px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		boxSizing: 'border-box',
	},

	ctaBgImage: {
		position: "absolute",
		inset: 0,
		width: "100%",
		height: "100%",
		objectFit: "cover",
		zIndex: 0,
		opacity: 0.2,
		pointerEvents: "none",
	},
	ctaContent: {
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
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		boxSizing: 'border-box',
	},
	ctaEyebrow: {
		...typographyStyles.title3,
		margin: 0,
		animationName: {
			from: { opacity: 0, transform: 'translateY(20px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationDelay: '0.2s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},
	ctaTitle: {
		...typographyStyles.display,
		color: tokens.colorBrandBackground,
		margin: 0,
		textAlign: "center",
		animationName: {
			from: { opacity: 0, transform: 'translateY(30px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.8s',
		animationDelay: '0.4s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},
	ctaActions: {
		gap: tokens.spacingHorizontalM,
		marginTop: tokens.spacingVerticalL,
		animationName: {
			from: { opacity: 0, transform: 'translateY(20px)' },
			to: { opacity: 1, transform: 'translateY(0)' }
		},
		animationDuration: '0.6s',
		animationDelay: '0.6s',
		animationTimingFunction: 'ease-out',
		animationFillMode: 'both',
	},

	///////////////////////////
	// Footer styles
	///////////////////////////
	footer: {
		width: '100%',
		padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalXXL}`,
		marginTop: tokens.spacingVerticalXXL,
		boxSizing: 'border-box',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},

	footerLinks: {
		display: 'flex',
		flexWrap: 'wrap',
		gap: tokens.spacingHorizontalXXL,
		justifyContent: 'center',
		alignItems: 'center',
		maxWidth: '1200px',
		width: '100%',
	},

	footerLink: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		textDecoration: 'none',
		gap: tokens.spacingHorizontalS,
		transition: 'all 0.2s ease',
		padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
		borderRadius: tokens.borderRadiusMedium,
		'&:hover': {
			backgroundColor: tokens.colorNeutralBackground2,
			transform: 'translateY(-2px)',
		}
	},

	footerIcon: {
		width: '20px',
		height: '20px',
		borderRadius: '4px',
		objectFit: 'cover',
		backgroundColor: 'transparent',
		border: 'none',
		filter: 'invert(0%)',
		transition: 'filter 0.3s ease',
	},

	footerIconDark: {
		filter: 'invert(100%)',
	},

	footerLinkText: {
		...typographyStyles.caption1,
		color: tokens.colorNeutralForeground2,
		fontWeight: tokens.fontWeightRegular,
		fontSize: tokens.fontSizeBase200,
		lineHeight: 1.2,
		margin: 0,
	},

	///////////////////////////
	// Login styles
	///////////////////////////
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

// Stats header styles
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