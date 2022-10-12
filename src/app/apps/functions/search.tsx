import SearchResult from "../components/search_results";

interface SearchProps {
	map: Object,
	info: Object,
	query: string,
	set: Function,
	show: Function
}
interface App {
	img: string,
	title: string,
	description: string,
	id: string,
	download_url: string
}

export default function Search(props: SearchProps) {
	const {
		map,
		info, 
		query,
		set,
		show
	} = props;

	const matches = getDataFromMatches(getMatches(map, query), info);

	return (
		<>
			{matches.map((app: App, index: number) => {
				return (
					<>
						<SearchResult {...app} downloadUrl={app.download_url} set={set} show={show}/>
						{String(index + 1) !== String(matches.length) ?
							<div className="h-[2px] rounded-xl my-[3px] mb-[5px] bg-gray-900 w-[100%]"></div>
						: <></>}
					</>
				);
			})}
		</>
	);
}

function getMatches(maps: Object, query: string): Array<string> {
	const keys = Object.keys(maps);
	const ids = Object.values(maps);

	return (
		keys
		.filter((value) => 
			value.replaceAll(" ", "").toLowerCase().includes(query.replaceAll(" ", "").toLowerCase())
		)
		.map((_, index) =>
			ids[index]
		)
	);
}

function getDataFromMatches(matches: Array<string>, apps: any) {
	let data = matches
		.map((id: any) => 
			apps[id]
		);
	if (data.length > 5) {
		data.length = 5;
	}
	return (
		data
	);
}