use std::{env, fs};

use crate::auth::{decrypt2, encrypt2};
use serde_json::{from_str, to_string};

use super::Preferences::{Data, Struct};
use super::{GlobalPreferences, Preferences};

static PATH: &str = "::root::\\ProgramData\\AHQ Store Applications\\perfs.encryped.json";

static mut PREFERENCES: Option<GlobalPreferences> = None;

pub fn get_prefs() -> GlobalPreferences {
    let preferences = unsafe { PREFERENCES.clone() };

    if let Some(x) = preferences {
        x
    } else {
        let data = fs::read_to_string(PATH.replace("::root::", &drive())).unwrap_or("".into());

        if let Some(x) = decrypt2(data) {
            return from_str(&x).unwrap_or(GlobalPreferences::default());
        }

        GlobalPreferences::default()
    }
}

pub fn update_prefs(perfs: Preferences) {
    let to_str = {
        match perfs {
            Struct(perfs) => to_string(&perfs).unwrap(),
            Data(s) => s,
        }
    };

    if let Some(x) = encrypt2(to_str.clone()) {
        fs::write(PATH.replace("::root::", &drive()), x).unwrap_or(());
    }

    unsafe {
        PREFERENCES = Some(from_str(&to_str).unwrap());
    }
}

fn drive() -> String {
    env::var("SystemDrive").unwrap()
}
