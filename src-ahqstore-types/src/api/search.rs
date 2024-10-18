use super::{flatpak, get_all_commits, get_all_search, Commits, SearchEntry};
use anyhow::{Context, Result};
use fuse_rust::{Fuse, Fuseable};
use serde::Serialize;
use std::{
  ptr::{addr_of, addr_of_mut},
  sync::LazyLock,
  time::{SystemTime, UNIX_EPOCH},
};

fn now() -> u64 {
  SystemTime::now()
    .duration_since(UNIX_EPOCH)
    .unwrap()
    .as_secs()
}

struct SCache {
  e: Vec<SearchEntry>,
  t: u64,
}

static mut SEARCH: Option<SCache> = None;
static FUSE: LazyLock<Fuse> = LazyLock::new(|| Fuse::default());

fn get_search_inner() -> Option<&'static Vec<SearchEntry>> {
  let addr = addr_of!(SEARCH);

  let search = unsafe {
    let addr = &*addr;

    let addr = addr.as_ref();
    addr
  };

  let Some(x) = search else {
    return None;
  };

  if x.t > now() {
    return Some(&x.e);
  }

  return None;
}

#[derive(Debug)]
pub enum RespSearchEntry {
  Static(&'static SearchEntry),
  Owned(SearchEntry),
}

impl Fuseable for RespSearchEntry {
  fn lookup(&self, key: &str) -> Option<&str> {
    match self {
      RespSearchEntry::Owned(x) => x.lookup(key),
      RespSearchEntry::Static(x) => x.lookup(key),
    }
  }

  fn properties(&self) -> Vec<fuse_rust::FuseProperty> {
    match self {
      RespSearchEntry::Owned(x) => x.properties(),
      RespSearchEntry::Static(x) => x.properties(),
    }
  }
}

impl Serialize for RespSearchEntry {
  fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
      where
          S: serde::Serializer {
      match self {
        RespSearchEntry::Owned(x) => x.serialize(serializer),
        RespSearchEntry::Static(x) => x.serialize(serializer),
      }
  }
}


pub async fn get_search(commit: Option<&Commits>, query: &str) -> Result<Vec<RespSearchEntry>> {
  let search = get_search_inner();

  let search = if search.is_none() {
    let commit = if commit.is_none() {
      &get_all_commits(None).await?
    } else {
      commit.unwrap()
    };

    let search = get_all_search(commit).await?;
    let addr = unsafe { &mut *addr_of_mut!(SEARCH) };
    *addr = Some(SCache {
      e: search,
      t: now() + 6 * 60,
    });

    get_search_inner().unwrap()
  } else {
    search.unwrap()
  };

  let mut res = vec![];

  for val in FUSE.search_text_in_fuse_list(query, search) {
    res.push(RespSearchEntry::Static(&search[val.index]));
  }

  for val in flatpak::search(query).await.context("")? {
    res.push(RespSearchEntry::Owned(val));
  }

  let mut final_res = vec![];
  for val in FUSE.search_text_in_fuse_list(query, &res) {
    let resp = res.remove(val.index);
    final_res.push(resp);
  }

  drop(res);

  Ok(final_res)
}
