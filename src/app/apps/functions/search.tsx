import React, { useEffect, useState } from "react";

import fetchApps, {
  appData,
} from "../../resources/api/fetchApps";
import SearchResult from "../components/search_results";
import AppCard from "../components/app_card";

import { getData, setData } from "../../resources/utilities/database";
import { search } from "@/app/resources/core";

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
            <React.Fragment key={`${index}`}>
              <SearchResult
                dark={dark}
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
            </React.Fragment>
          );
        })}
        {matches.length === 0 ? (
          <div
            className={`mx-auto my-2 flex items-center justify-center ${
              dark ? "text-slate-200" : ""
            }`}
          >
            <span className="block">
              {searched ? (
                <>0 Apps Found</>
              ) : (
                <div className="flex">
                  <span className="dui-loading dui-loading-spinner" />
                  <span className="ml-2">Just a moment...</span>
                </div>
              )}
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
              id={app.appId}
              key={app.appId}
              dark={dark}
              onClick={() => {
                set(app.appId);
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
              {searched ? (
                "0 Apps Found"
              ) : (
                <div className="flex w-[100%] justify-center">
                  <span className="dui-loading dui-loading-spinner dui-loading-lg" />
                  <span className="ml-2">Just a moment...</span>
                </div>
              )}
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

async function getMatches(query: string): Promise<string[]> {
  return await search(query);
}

async function getDataFromMatches(matches: Array<string>) {
  return fetchApps(matches);
}

export { getDataFromMatches };
