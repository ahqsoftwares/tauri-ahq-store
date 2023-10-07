use iced::{
  widget::container::{Appearance, StyleSheet},
  Background, Color, Theme,
};

pub struct Windows11Style;

impl StyleSheet for Windows11Style {
  type Style = Theme;

  fn appearance(&self, _: &Self::Style) -> iced::widget::container::Appearance {
    Appearance {
      border_radius: 50.0.into(),
      background: Some(Background::Color(Color::BLACK)),
      ..Default::default()
    }
  }
}
