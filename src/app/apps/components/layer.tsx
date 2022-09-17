export default function Splitter(props: {children: any, alt: string}) {
	return (
		<div className="layer">
			<h1 className="title">{props.alt}</h1>
			<div className="item">
				{props.children}
			</div>
		</div>
	);
}