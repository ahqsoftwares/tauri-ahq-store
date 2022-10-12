interface SearchPropsToRender {
	img: string,
	title: string,
	description: string,
	id: string,
	set: Function,
	downloadUrl: string,
	show: Function
}

export default function Load(props: SearchPropsToRender) {
	const {
		img,
		title,
		description,
		downloadUrl,
		show,
		set,
		id
	} = props;

	return (
		<div 
			className="flex w-[100%] h-[3rem] shoadow-2xl rounded-xl" 
			style={{"cursor": "pointer"}}
			onClick={() => {
				console.log("Clocked!");
				set({
					img,
					downloadUrl,
					id
				});
				show();
			}}
		>
			<img src={img} alt="Logo"/>
			<div className="ml-2">
				<h1 className="text-blue-500">{title}</h1>
				<h2>{description.length > 30 ? `${description.substring(0, 30)}...` : description}</h2>
			</div>
		</div>
	);
}