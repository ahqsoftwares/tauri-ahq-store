#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod shell;
mod structs;
mod util;

use std::{process, thread, time::Duration};

use iced_core::Color;
use structs::*;
use util::*;

use iced::{
  alignment::Horizontal,
  theme::{Custom, Palette},
  widget::{self, image::Handle, progress_bar, text, vertical_space},
  window::{icon::from_file_data, PlatformSpecific, Position},
  Application, Command, Element, Length, Result, Settings, Subscription, Theme,
};

use image::ImageFormat;

pub fn main() -> Result {
  if !is_elevated::is_elevated() {
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

  let mut options = Settings::default();

  options.window.size = (400, 650);
  options.window.resizable = false;
  options.window.decorations = false;
  options.window.platform_specific = PlatformSpecific {
    drag_and_drop: false,
    ..Default::default()
  };
  options.window.icon =
    Some(from_file_data(include_bytes!("./icon.png"), Some(ImageFormat::Png)).unwrap());
  options.window.position = Position::Centered;
  options.window.transparent = true;

  Installer::run(options)
}

struct Installer {
  installing: bool,
  step: String,
  progress: f32,
}

#[derive(Debug, Clone, Copy)]
pub enum Message {
  StartInstall,
  Worker(InstallerWorker),
}

impl Application for Installer {
  type Message = Message;
  type Executor = iced::executor::Default;
  type Flags = ();
  type Theme = Theme;

  fn theme(&self) -> Theme {
    let dark_pallate = Palette::DARK;

    Theme::Custom(Box::new(Custom::new(Palette {
      background: Color::TRANSPARENT,
      danger: dark_pallate.danger,
      primary: dark_pallate.primary,
      success: dark_pallate.success,
      text: dark_pallate.text,
    })))
  }

  fn new(_: Self::Flags) -> (Self, iced::Command<Self::Message>) {
    (
      Self {
        installing: false,
        step: String::new(),
        progress: 0.0,
      },
      iced::Command::none(),
    )
  }

  fn title(&self) -> String {
    String::from("TAStore - Installer")
  }

  fn view(&self) -> Element<Message> {
    let mut column = widget::column![
      vertical_space(25),
      widget::image(Handle::from_memory(include_bytes!("./icon.png")))
        .width(100)
        .height(100),
      vertical_space(5),
      widget::Text::new(format!("AHQ Store v{}", env!("CARGO_PKG_VERSION"))).size(40),
    ]
    .padding(5)
    .align_items(iced::Alignment::Center);

    column = column.push(vertical_space(Length::Fill));

    if self.installing {
      column = column.push(text(&self.step).size(30));

      column = column.push(vertical_space(15));

      column = column.push(progress_bar(0.0..=100.0, self.progress).width(380));
    } else {
      column = column.push(
        widget::button(
          widget::Text::new("Install")
            .horizontal_alignment(Horizontal::Center)
            .size(30),
        )
        .style(iced::theme::Button::Positive)
        .width(380)
        .on_press(Message::StartInstall),
      );
    }

    column = column.push(vertical_space(10));

    let layout = widget::Container::new(column)
      .align_x(Horizontal::Center)
      .height(Length::Fill)
      .width(Length::Fill)
      .style(iced::theme::Container::Custom(Box::new(Windows11Style)));

    layout.into()
  }

  fn subscription(&self) -> Subscription<Self::Message> {
    subscribe().map(Message::Worker)
  }

  fn update(&mut self, message: Message) -> Command<Self::Message> {
    match message {
      Message::StartInstall => {
        self.installing = true;

        self.step = "Preparing".into();

        mk_dir();

        start_install();
      }
      Message::Worker(InstallerWorker::MsiInstalling) => {
        self.step = "Installing App".into();
      }
      Message::Worker(InstallerWorker::ServiceInstalling) => {
        self.step = "Installing App Service".into();
      }
      Message::Worker(InstallerWorker::Installed) => {
        self.step = "Installed".into();

        thread::spawn(|| {
          thread::sleep(Duration::from_secs(2));

          process::exit(0);
        });
      }
    }

    Command::none()
  }
}
