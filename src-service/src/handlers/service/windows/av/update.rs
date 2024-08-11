use std::process::Command;

use super::DEFENDER_CMD;

pub fn update_win_defender() -> Option<()> {
  if !Command::new(DEFENDER_CMD)
    .args(["-SignatureUpdate"])
    .spawn()
    .ok()?
    .wait()
    .ok()?
    .success()
  {
    return None;
  }

  Some(())
}
