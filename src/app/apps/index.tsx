/*
React Native
*/
import { useState } from "react";
import { Auth } from "firebase/auth";

/*
Components
*/
import Layer from "./components/layer";
import Card from "./components/app_card";
import Modal from "./components/modal";
/*import AHQStore from "./icon.png";*/

/*
StyleSheets
*/
import "./index.css";


/*
Interfaces
*/
/*type store = {
	title: string,
	description: string,
	img: string,
	appId: string,
	installData: {
		downloadUrl: string,
		installer: string,
		location: string
	}
}*/
interface AppsProps {
	dark: boolean,
	auth: Auth,
	apps: Array<any>,
	allAppsData: any
}

function darkMode(classes: Array<string>, dark: boolean) {
    return classes.map((c) => c + (dark ? "-d" : "")).join(" ");
}

export default function Apps(props: AppsProps){
	const {
		dark,
		apps,
		allAppsData
	} = props;

	const [shown, showModal] = useState(false),
	[data, setData] = useState({
		img: "",
		downloadUrl: "",
		id: ""
	});

	function change() {
		showModal(!shown);
	}

	let key = 0;
	function keyGen() {
		key += 1;
		return key;
	}

	return (
		<div className={darkMode(["menu"], dark)}>
			<Modal shown={shown} dark={dark} change={change} installData={data} />
			<h6 className="apps-desc">Explore our apps!</h6>

			<div className="appss">
				{apps.length === 0
					?
						<>
							<h1 className="apps-text">Loading Your Apps...</h1>
						</>
					:
						<>
						</>
				}

				{apps.map((filess: any) => {
					try {
					const [alt, data] = filess;
					const apps: any = data;
					return (
						<Layer alt={alt as string} key={keyGen()}>
							{apps.map((data: string) => {
								try {
								const {
									title, 
									description,
									img, 
									download_url: downloadUrl,
									author
								} = allAppsData.info[data];

								return (
									<Card key={keyGen()} title={title} description={description} img={img} footer={<button className="text-blue-500 text-2xl" style={{"minWidth": "95%"}}>{author.displayName}</button>} onClick={() => {
										setData({img, downloadUrl, id: data});
										change();
									}}/>
								)
								} catch (e) {
									return (<h1 key={keyGen()}></h1>);
								}
							})}
						</Layer>
					)
					} catch (e) {
						return (<h1 key={keyGen()} ></h1>);
					}
				})}
			</div>
		</div>
	);
}