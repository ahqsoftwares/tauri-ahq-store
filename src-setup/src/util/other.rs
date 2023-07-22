use std::{
    fs::{self, create_dir_all},
    os::windows::process::CommandExt,
    process::Command,
};

use crate::shell;

pub static ROOT: &str = "{root}\\ProgramData\\AHQ Store Applications";

pub static FRAMEWORK: &str = "{root}\\ProgramData\\AHQ Store Applications\\Framework";
pub static PROGRAMS: &str = "{root}\\ProgramData\\AHQ Store Applications\\Programs";
pub static UPDATERS: &str = "{root}\\ProgramData\\AHQ Store Applications\\Updaters";
pub static INSTALLERS: &str = "{root}\\ProgramData\\AHQ Store Applications\\Installers";

pub fn system_drive() -> String {
    std::env::var("SystemDrive").unwrap()
}

pub fn mk_dir() {
    let sys = system_drive();

    let _ = (
        create_dir_all(&FRAMEWORK.replace("{root}", &sys)),
        create_dir_all(&PROGRAMS.replace("{root}", &sys)),
        create_dir_all(&UPDATERS.replace("{root}", &sys)),
        create_dir_all(&INSTALLERS.replace("{root}", &sys)),
    );
}

pub fn install_msi() {
    let msi = include_bytes!("../bin/installer.msi");

    let expected_file_path = format!(
        "{}\\installer.msi",
        INSTALLERS.replace("{root}", &system_drive())
    );

    let _ = fs::remove_file(&expected_file_path);

    fs::write(&expected_file_path, msi).unwrap();

    shell::launch(
        &[
            "start-process",
            "-FilePath",
            &format!("\"{}\"", &expected_file_path),
            "-Wait",
            "-ArgumentList",
            "/quiet, /passive",
        ],
        None,
    );
}

pub fn install_service() {
    let service = include_bytes!("../bin/service.exe");
    let path = format!(
        "{}\\ahqstore_service.exe",
        ROOT.replace("{root}", &system_drive())
    );

    let res = Command::new("sc.exe")
        .creation_flags(0x08000000)
        .args(["stop", "AHQ Store Service"])
        .spawn()
        .unwrap()
        .wait();

    drop(res);

    let res = Command::new("sc.exe")
        .creation_flags(0x08000000)
        .args(["delete", "AHQ Store Service"])
        .spawn()
        .unwrap()
        .wait();

    drop(res);

    fs::write(&path, service).unwrap_or(());

    Command::new("sc.exe")
        .creation_flags(0x08000000)
        .args([
            "create",
            "AHQ Store Service",
            "start=",
            "auto",
            "binpath=",
            &path,
        ])
        .spawn()
        .unwrap()
        .wait()
        .unwrap();

    Command::new("sc.exe")
        .creation_flags(0x08000000)
        .args(["start", "AHQ Store Service"])
        .spawn()
        .unwrap()
        .wait()
        .unwrap();
}
