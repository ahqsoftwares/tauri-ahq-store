import { useEffect, useState } from "react";
import fetchApps from "../../resources/api/fetchApps";
import SearchResult from "../components/search_results";

interface SearchProps {
  map: Object;
  query: string;
  set: Function;
  show: Function;
}
interface App {
  img: string;
  title: string;
  description: string;
  id: string;
}

export default function Search(props: SearchProps) {
  const { map, query, set, show } = props;

  const [matches, setMatches] = useState<any>([]);

  useEffect(() => {
    (async () => {
      const results = await getDataFromMatches(getMatches(map, query));
      setMatches(results);
    })();
  }, [map, query]);

  return (
    <>
      {matches.map((app: App, index: number) => {
        return (
          <>
            <SearchResult {...app} set={set} show={show} />
            {String(index + 1) !== String(matches.length) ? (
              <div className="h-[2px] rounded-xl my-[3px] mb-[5px] bg-gray-900 w-[100%]"></div>
            ) : (
              <></>
            )}
          </>
        );
      })}
    </>
  );
}

function getMatches(maps: Object, query: string): Array<string> {
  const keys = Object.keys(maps);
  const ids = Object.values(maps);

  return keys
    .filter((value) =>
      value
        .replaceAll(" ", "")
        .toLowerCase()
        .includes(query.replaceAll(" ", "").toLowerCase())
    )
    .map((_, index) => ids[index]);
}

async function getDataFromMatches(matches: Array<string>) {
  let answer: any = [];

  let data = matches.map((id: string) => fetchApps(id));

  await Promise.all(data).then((results) => {
    answer = results;

    if (results.length > 5) {
      answer.length = 5;
    }
  });

  return answer;
}
