use std::{
    os::windows::process::CommandExt,
    process::{Command, Stdio},
};

use is_elevated::is_elevated;

mod download;
mod powershell;
mod shell;

use download::download;
use powershell::get_ahqstore_service;

fn main() {
    #[cfg(debug_assertions)]
println!(r#"
░█████╗░██╗░░██╗░██████╗░  ░██████╗████████╗░█████╗░██████╗░███████╗
██╔══██╗██║░░██║██╔═══██╗  ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗██╔════╝
███████║███████║██║██╗██║  ╚█████╗░░░░██║░░░██║░░██║██████╔╝█████╗░░
██╔══██║██╔══██║╚██████╔╝  ░╚═══██╗░░░██║░░░██║░░██║██╔══██╗██╔══╝░░
██║░░██║██║░░██║░╚═██╔═╝░  ██████╔╝░░░██║░░░╚█████╔╝██║░░██║███████╗
╚═╝░░╚═╝╚═╝░░╚═╝░░░╚═╝░░░  ╚═════╝░░░░╚═╝░░░░╚════╝░╚═╝░░╚═╝╚══════╝ 

░██████╗███████╗██████╗░██╗░░░██╗██╗░█████╗░███████╗
██╔════╝██╔════╝██╔══██╗██║░░░██║██║██╔══██╗██╔════╝
╚█████╗░█████╗░░██████╔╝╚██╗░██╔╝██║██║░░╚═╝█████╗░░
░╚═══██╗██╔══╝░░██╔══██╗░╚████╔╝░██║██║░░██╗██╔══╝░░
██████╔╝███████╗██║░░██║░░╚██╔╝░░██║╚█████╔╝███████╗
╚═════╝░╚══════╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝░╚════╝░╚══════╝"#);

    std::thread::sleep(std::time::Duration::from_secs(2));

    if !is_elevated() {
        let buf = std::env::current_exe().unwrap().to_owned();
        let exec = buf.clone().to_str().unwrap().to_owned();

        shell::launch(
            &[
                "Start-Process",
                "-FilePath",
                format!("\"{}\"", exec.as_str()).as_str(),
                "-verb",
                "runas",
            ],
            None,
        );

        std::process::exit(0);
    }

    std::thread::sleep(std::time::Duration::from_secs(2));

    let sys_dir = std::env::var("SYSTEMROOT")
        .unwrap()
        .to_uppercase()
        .as_str()
        .replace("\\WINDOWS", "")
        .replace("\\Windows", "");

    let astore_dir = format!("{}\\ProgramData\\AHQ Store Applications", sys_dir);

    #[cfg(debug_assertions)]
println!("Getting AHQ Store Service release...");

    let ahqstore_service_url = get_ahqstore_service(0);

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

    #[cfg(debug_assertions)]
println!(
        "Downloading AHQ Store Services... ({})",
        &ahqstore_service_url
    );

    std::fs::remove_file(format!("{}\\ahqstore_service.exe", &astore_dir)).unwrap_or(());

    download(&astore_dir, &ahqstore_service_url);

    #[cfg(debug_assertions)]
println!("Downloaded files");

    #[cfg(debug_assertions)]
println!("Installing AHQ Store Services...");

    let output = Command::new("sc.exe")
        .creation_flags(0x08000000)
        .args([
            "create",
            "AHQ Store Service",
            "start=",
            "auto",
            "binpath=",
            format!("{}\\ahqstore_service.exe", &astore_dir).as_str(),
        ])
        .stdout(Stdio::piped())
        .spawn()
        .unwrap()
        .wait_with_output()
        .unwrap();

    let out = String::from_utf8(output.stdout).unwrap_or("".to_owned());
    #[cfg(debug_assertions)]
println!("{}", out);
    #[cfg(debug_assertions)]
println!("Installed, Starting service...");

    let output = Command::new("sc.exe")
        .creation_flags(0x08000000)
        .args(["start", "AHQ Store Service"])
        .stdout(Stdio::piped())
        .spawn()
        .unwrap()
        .wait_with_output()
        .unwrap();

    let out = String::from_utf8(output.stdout).unwrap_or("".to_owned());

    #[cfg(debug_assertions)]
println!("{}", out);

    #[cfg(debug_assertions)]
println!(r#"
███████████████████████████████████████████████████████
█▄─▄█▄─▀█▄─▄█─▄▄▄▄█─▄─▄─██▀▄─██▄─▄███▄─▄███▄─▄▄─█▄─▄▄▀█
██─███─█▄▀─██▄▄▄▄─███─████─▀─███─██▀██─██▀██─▄█▀██─██─█
▀▄▄▄▀▄▄▄▀▀▄▄▀▄▄▄▄▄▀▀▄▄▄▀▀▄▄▀▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▄▄▄▄▄▀▄▄▄▄▀▀"#);

    std::thread::sleep(std::time::Duration::from_secs(3));
}
