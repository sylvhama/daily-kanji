interface CellProps {
	children: React.ReactNode;
	gridArea: string;
	alignContent?: string;
	opacity?: number;
}

export function Cell({
	children,
	gridArea,
	opacity,
	alignContent = 'flex-start',
}: CellProps) {
	return (
		<div
			style={{
				gridArea,
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				alignContent,
				opacity,
			}}
		>
			{children}
		</div>
	);
}
