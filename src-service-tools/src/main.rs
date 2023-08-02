use std::{fs, os::windows::process::CommandExt, process::Command, time::Duration};

use is_elevated::is_elevated;

mod download;
mod get_release;
mod shell;

use download::download;
use get_release::get_urls;

use eframe::{
    egui::{self, RichText, Ui},
    IconData,
};

fn main() -> Result<(), eframe::Error> {
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

    env_logger::init();

    #[cfg(debug_assertions)]
    println!(
        r#"
██╗░░░░░░█████╗░██╗░░░██╗███╗░░██╗░█████╗░██╗░░██╗██╗███╗░░██╗░██████╗░  ░██████╗░██╗░░░██╗██╗
██║░░░░░██╔══██╗██║░░░██║████╗░██║██╔══██╗██║░░██║██║████╗░██║██╔════╝░  ██╔════╝░██║░░░██║██║
██║░░░░░███████║██║░░░██║██╔██╗██║██║░░╚═╝███████║██║██╔██╗██║██║░░██╗░  ██║░░██╗░██║░░░██║██║
██║░░░░░██╔══██║██║░░░██║██║╚████║██║░░██╗██╔══██║██║██║╚████║██║░░╚██╗  ██║░░╚██╗██║░░░██║██║
███████╗██║░░██║╚██████╔╝██║░╚███║╚█████╔╝██║░░██║██║██║░╚███║╚██████╔╝  ╚██████╔╝╚██████╔╝██║
╚══════╝╚═╝░░╚═╝░╚═════╝░╚═╝░░╚══╝░╚════╝░╚═╝░░╚═╝╚═╝╚═╝░░╚══╝░╚═════╝░  ░╚═════╝░░╚═════╝░╚═╝

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
╚═════╝░╚══════╝╚═╝░░╚═╝░░░╚═╝░░░╚═╝░╚════╝░╚══════╝"#
    );

    let mut options = eframe::NativeOptions::default();

    options.initial_window_size = Some(egui::vec2(950.0, 300.0));
    options.icon_data = Some(IconData::try_from_png_bytes(include_bytes!("./icon.png")).unwrap());
    options.resizable = false;
    options.maximized = false;

    eframe::run_native(
        "Install AHQ Store Tools",
        options,
        Box::new(|_cc| Box::<ToolsInstallerWindow>::default()),
    )
}

struct ToolsInstallerWindow {
    install_framework: bool,
    started_install: bool,
}

impl Default for ToolsInstallerWindow {
    fn default() -> Self {
        Self {
            install_framework: true,
            started_install: false,
        }
    }
}

impl eframe::App for ToolsInstallerWindow {
    fn update(&mut self, ctx: &egui::Context, frame: &mut eframe::Frame) {
        frame.request_user_attention(egui::UserAttentionType::Critical);
        frame.set_always_on_top(true);
        frame.set_centered();

        egui::CentralPanel::default().show(ctx, |ui| {
            ui.add_space(12.0);
            ui.vertical_centered_justified(|ui| {
                ui.label(
                    RichText::new("Customize your install")
                        .size(80.0)
                        .text_style(egui::TextStyle::Heading)
                        .heading(),
                );
            });

            ui.add_space(20.0);

            if ui
                .add_enabled(!self.started_install, |ui: &mut Ui| {
                    ui.vertical_centered(|ui: &mut Ui| {
                        ui.checkbox(
                            &mut self.install_framework,
                            RichText::new(
                                "Install the AHQ Store Framework (recommended, 130-200mb)",
                            )
                            .size(25.0)
                            .text_style(egui::TextStyle::Button),
                        );
                    });

                    ui.add_space(20.0);

                    ui.vertical_centered(|ui| ui.button(RichText::new("Install").size(50.0)))
                        .inner
                })
                .clicked()
            {
                self.started_install = true;

                frame.set_visible(false);
                ctx.request_repaint();

                let install_framework = self.install_framework;

                std::thread::spawn(move || {
                    let service = get_urls(10, false);
                    let service = &service[0];

                    let sys_dir = std::env::var("SYSTEMROOT")
                        .unwrap()
                        .to_uppercase()
                        .as_str()
                        .replace("\\WINDOWS", "")
                        .replace("\\Windows", "");

                    let astore_dir = format!("{}\\ProgramData\\AHQ Store Applications", sys_dir);

                    let astore_framework_dir = format!(
                        "{}\\ProgramData\\AHQ Store Applications\\Framework",
                        sys_dir
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

                    fs::create_dir_all(&astore_dir).unwrap_or(());
                    fs::remove_file(format!("{}\\ahqstore_service.exe", &astore_dir)).unwrap_or(());

                    download(&astore_dir, &service);

                    Command::new("sc.exe")
                        .creation_flags(0x08000000)
                        .args([
                            "create",
                            "AHQ Store Service",
                            "start=",
                            "auto",
                            "binpath=",
                            format!("{}\\ahqstore_service.exe", &astore_dir).as_str(),
                        ])
                        .spawn()
                        .unwrap()
                        .wait()
                        .unwrap();

                    #[cfg(debug_assertions)]
                    println!("Installed, Starting service...");

                    Command::new("sc.exe")
                        .creation_flags(0x08000000)
                        .args(["start", "AHQ Store Service"])
                        .spawn()
                        .unwrap()
                        .wait()
                        .unwrap();

                    if install_framework {
                        let framework_urls = get_urls(10, true);

                        fs::remove_dir_all(&astore_framework_dir).unwrap_or(());
                        fs::create_dir_all(&astore_framework_dir).unwrap_or(());

                        for url in framework_urls {
                            #[cfg(debug_assertions)]
                            println!("Downloading Framework Depedency: {}", &url);

                            download(&astore_framework_dir, &url);
                        }

                        #[cfg(debug_assertions)]
                        println!("Running Post-Install script...");

                        Command::new("powershell")
                            .arg("Expand-Archive")
                            .arg("-Path ./js.zip")
                            .arg("-DestinationPath ./js")
                            .arg("-Force")
                            .current_dir(&astore_framework_dir)
                            .spawn()
                            .unwrap()
                            .wait()
                            .unwrap();

                        Command::new("powershell")
                            .arg("Expand-Archive")
                            .arg("-Path ./node.zip")
                            .arg("-DestinationPath ./node")
                            .arg("-Force")
                            .current_dir(&astore_framework_dir)
                            .spawn()
                            .unwrap()
                            .wait()
                            .unwrap();

                        fs::remove_file(format!("{}\\js.zip", &astore_framework_dir)).unwrap_or(());
                        fs::remove_file(format!("{}\\node.zip", &astore_framework_dir))
                            .unwrap_or(());

                        #[cfg(debug_assertions)]
                        println!("Installed Successfully!");

                        std::thread::sleep(Duration::from_secs(2));

                        std::process::exit(0);
                    } else {
                        std::thread::sleep(Duration::from_secs(5));

                        std::process::exit(0);
                    }
                });
            }
        });
    }
}
