export interface IAuthorObject {
    displayName: string;
    email: string;
    apps: []
        | {
            apps: string[];
            ignored: string[];
        };
};

export interface IAppDataApi {
    author: string;
  AuthorObject?: IAuthorObject;
  description: string;
  download: string;
  exe: string;
  icon: string;
  repo: {
    author: string;
    repo: string;
  };
  title: string;
  displayName: string;
  version: string;
  id: string;
}

export interface ICache {
    [key: string]: IAppDataApi;
}

export interface ISearchData {
    name: string;
    id: string;
}