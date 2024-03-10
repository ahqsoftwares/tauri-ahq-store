use discord_rich_presence::{
  activity::{Activity, Assets, Button},
  DiscordIpc, DiscordIpcClient,
};

use std::thread::spawn;
use std::time::Duration;

static CLIENT_ID: &str = "897736309806882827";

pub fn init_presence(window: tauri::Window) {
  let _ = spawn(move || {
    if let Ok(mut rpc) = DiscordIpcClient::new(CLIENT_ID) {
      loop {
        if let Ok(_) = rpc.connect() {
          break;
        }
        std::thread::sleep(Duration::from_secs(1));
      }

      let version = env!("CARGO_PKG_VERSION");

      #[cfg(not(debug_assertions))]
      let deatils = format!("v{}", &version);

      #[cfg(debug_assertions)]
      let deatils = format!("v{}-next-internal", &version);

      loop {
        let title = window
          .title()
          .unwrap_or("Home - AHQ Store".into())
          .replace(" - AHQ Store", " Page")
          .replace("AHQ Store", "Loading Screen");
        let title = format!("Viewing {}", &title);

        let activity = Activity::new()
          .state(&title)
          .details(&deatils)
          .assets(
            Assets::new()
              .large_image("icon")
              .large_text("AHQ Store")
              .small_image("dev")
              .small_text("ahqsoftwares"),
          )
          .buttons(vec![Button::new("Download", "https://ahqstore.github.io")]);

        if let Err(_) = rpc.set_activity(activity) {
          let _ = rpc.reconnect();
        }
        std::thread::sleep(Duration::from_secs(5));
      }
    } else {
      println!("Fail...");
    }
  });
}
