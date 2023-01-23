//Worker
import { BiArrowBack } from "react-icons/bi";

interface AppDataPropsModal {
  shown: boolean;
  change: Function;
  dark: Boolean;
  search: string;
  searchText: (text: string) => void;
}

export default function SearchModal(props: AppDataPropsModal) {
  const { shown, dark, change, searchText, search } = props;

  return (
    <>
      {shown ? (
        <div className="flex flex-col w-[100%] h-[100%] mt-3 p-2">
          <div className={`flex ${dark ? "text-slate-300" : "text-slate-800"}`}>
            <button
              onClick={() => {
                change();
              }}
              style={{
                "borderTopRightRadius": "0",
                "borderBottomRightRadius": "0",
                "transition": "all 250ms linear"
              }}
              className={`rounded-md p-2 ${
                dark ? "hover:bg-gray-600" : "hover:bg-white"
              }`}
            >
              <BiArrowBack size="1.5em" />
            </button>
            <input
              className={`search-input search-input-modified ${
                dark ? "style-input-d" : ""
              } mx-auto mr-2`}
              placeholder={`🔎 Search the whole of AHQ Store`}
              value={search}
              onChange={(e) => {
                searchText(e.target.value);
              }}
              style={{
                "borderTopLeftRadius": "0",
                "borderBottomLeftRadius": "0"
              }}
              autoComplete={"off"}
              id="special-modal"
            ></input>
          </div>
          <div></div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
