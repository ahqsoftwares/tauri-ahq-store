interface AppCardProps {
	title: string,
	description: any,
	footer: any,
	img: string,
	onClick: any
}

export default function AppCard(props: AppCardProps) {
	const {
		title, 
		description, 
		footer,
		img,
		onClick: handleClick
	} = props;

	return (
		<div className="card" style={{"cursor": "pointer"}} onClick={handleClick}>
			<img className="card-img" src={img} alt=""></img>

			<h1 className="card-title">{title}</h1>
			
			<div className="card-description">
				{description}
			</div>

			<div className="card-footer">
				{footer}
			</div>
		</div>
	);
}