import { useEffect, useState } from "react";

import SearchModule from "fuse.js";
import fetchApps, {
  appData,
  fetchSearchData,
} from "../../resources/api/fetchApps";
import SearchResult from "../components/search_results";
import AppCard from "../components/app_card";

import { getData, setData } from "../../resources/utilities/database";

interface SearchProps {
  query: string;
  set: Function;
  show: Function;
  dark: boolean;
  special?: boolean;
  isAdmin: boolean;
}

export default function Search(props: SearchProps) {
  const { query, set, show, dark, special, isAdmin } = props;

  const [matches, setMatches] = useState<appData[]>([]);
  const [searched, setSearched] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const results = await getDataFromMatches(await getMatches(query));

      setMatches(results as appData[]);
      setSearched(true);
    })();
  }, [query]);

  if (!special) {
    return (
      <>
        {matches.map((app, index) => {
          return (
            <>
              <SearchResult
                dark={dark}
                key={app.id}
                {...app}
                set={set}
                show={show}
                isAdmin={isAdmin}
              />
              {String(index + 1) !== String(matches.length) ? (
                <div
                  className={`h-[2px] rounded-xl my-[3px] mb-[5px] ${
                    dark ? "bg-white" : "bg-gray-900"
                  } w-[100%]`}
                ></div>
              ) : (
                <></>
              )}
            </>
          );
        })}
        {matches.length === 0 ? (
          <div
            className={`mx-auto my-2 flex items-center justify-center ${
              dark ? "text-slate-200" : ""
            }`}
          >
            <span className="block">
              {searched ? "0 Apps Found" : "Just a moment..."}
            </span>
          </div>
        ) : (
          <></>
        )}
      </>
    );
  } else {
    return (
      <div
        className={`w-[100%] h-[auto] overflow-scroll search-app-grid ${
          matches.length == 0 ? "special-app-grid" : ""
        }`}
      >
        {matches.map((app) => {
          return (
            <AppCard
              id={app.id}
              key={app.id}
              dark={dark}
              onClick={() => {
                set(app.id);
                show();
              }}
            />
          );
        })}
        {matches.length === 0 ? (
          <div
            className={`mx-auto my-2 flex items-center justify-center ${
              dark ? "text-slate-200" : ""
            }`}
          >
            <span className="block">
              {searched ? "0 Apps Found" : "Just a moment..."}
            </span>
          </div>
        ) : (
          <></>
        )}
        <div className="h-[5rem]"></div>
      </div>
    );
  }
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
  return fetchApps(matches);
}

export { getMatches, getDataFromMatches };
