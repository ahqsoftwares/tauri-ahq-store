#![allow(non_snake_case)]

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Installer {
  pub Architecture: String,
  pub InstallerType: Option<String>,
  pub InstallerLocale: Option<String>,
  pub InstallerUrl: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct InstallerScheme {
  pub PackageIdentifier: String,
  pub PackageVersion: String,
  pub Installers: Vec<Installer>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct WingetApplication {
  pub PackageIdentifier: String,
  pub PackageVersion: String,
  pub Publisher: Option<String>,
  pub PublisherUrl: Option<String>,
  pub Copyright: Option<String>,
  pub ShortDescription: Option<String>,
  pub Description: Option<String>,
  pub ReleaseNotes: Option<String>,
  pub PackageName: String,
  pub PackageUrl: Option<String>,
  pub License: Option<String>,
  pub LicenseUrl: Option<String>,
}