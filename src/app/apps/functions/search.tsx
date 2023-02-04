import { useEffect, useState } from "react";
import SearchModule from "fuse.js";

import fetchApps, { fetchSearchData } from "../../resources/api/fetchApps";
import SearchResult from "../components/search_results";
import { getData, setData } from "../../resources/utilities/database";

interface SearchProps {
  query: string;
  set: Function;
  show: Function;
  dark: boolean;
}
interface App {
  img: string;
  title: string;
  description: string;
  id: string;
}

export default function Search(props: SearchProps) {
  const { query, set, show, dark } = props;

  const [matches, setMatches] = useState<any>([]);
  const [searched, setSearched] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const results = await getDataFromMatches(await getMatches(query));
      setMatches(results);
      setSearched(true);
    })();
  }, [query]);

  return (
    <>
      {matches.map((app: App, index: number) => {
        return (
          <>
            <SearchResult dark={dark} key={app.id} {...app} set={set} show={show} />
            {String(index + 1) !== String(matches.length) ? (
              <div className="h-[2px] rounded-xl my-[3px] mb-[5px] bg-gray-900 w-[100%]"></div>
            ) : (
              <></>
            )}
          </>
        );
      })}
      {matches.length === 0 ? (
        <div className="mx-auto my-2 flex items-center justify-center">
          <span className="block">
            {searched ? "0 Apps Found" : "Just a moment..."}
          </span>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

async function getMatches(query: string): Promise<Array<string>> {
  let data = getData(query);

  if (!data) {
    const search = new SearchModule(await fetchSearchData(), {
      keys: ["name"],
    });

    let result = search.search(query, { limit: 5 });

    let finalResult = result.map(({ item: { id } }) => id);
    setData(query, finalResult);

    return finalResult;
  } else {
    return data as any;
  }
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
